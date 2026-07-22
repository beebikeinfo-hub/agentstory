"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MODELS, BeeBikeModel, ModelImage } from "@/lib/models";
import { TEMPLATES, Template } from "@/lib/templates";
import { loadHistory, saveHistoryEntry, deleteHistoryEntry, HistoryEntry } from "@/lib/history";
import { loadCopyChips, addCopyChip, removeCopyChip } from "@/lib/copy-library";
import StoryPreview from "@/components/StoryPreview";

const Y = "#F5C842";
const BG = "#060606";
const CARD = "#0d0d0d";
const BORDER = "#1a1a1a";

type Tab = "create" | "history";
type Mode = "template" | "inspiration";
type PriceMode = "hide" | "cash" | "monthly" | "both";

function pollJob(jobId: string, onProgress?: (msg: string) => void): Promise<string[]> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const poll = async () => {
      attempts++;
      if (attempts > 80) return reject(new Error("Timeout — 4 min prošlo"));
      try {
        const r = await fetch(`/api/status/${jobId}`);
        const s = await r.json();
        const status = (s.status || s.state || "").toLowerCase();
        onProgress?.(`Čekam rezultat (${attempts * 3}s)...`);

        if (status === "completed" || status === "succeeded" || status === "success") {
          const urls: string[] = [];
          if (s.results && Array.isArray(s.results)) {
            s.results.forEach((r: { url?: string }) => r.url && urls.push(r.url));
          }
          if (s.output && Array.isArray(s.output)) urls.push(...s.output.filter(Boolean));
          if (s.result?.url) urls.push(s.result.url);
          if (s.url) urls.push(s.url);
          if (s.image_url) urls.push(s.image_url);
          const unique = [...new Set(urls)];
          if (unique.length > 0) return resolve(unique);
        }
        if (status === "failed" || status === "error") return reject(new Error(s.error || "Nije uspelo"));
        setTimeout(poll, 3000);
      } catch (e) { reject(e); }
    };
    poll();
  });
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("create");
  const [mode, setMode] = useState<Mode>("template");
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Inspiration mode state
  const [inspoPreview, setInspoPreview] = useState<string | null>(null);
  const [inspoBase64, setInspoBase64] = useState<string | null>(null);
  const [inspoMediaType, setInspoMediaType] = useState<string>("image/jpeg");
  const [dragOver, setDragOver] = useState(false);

  // Template mode state
  const [selectedTemplateId, setSelectedTemplateId] = useState("hero");

  // Common state
  const [selectedModelId, setSelectedModelId] = useState("cappuccino");
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [priceMode, setPriceMode] = useState<PriceMode>("hide");
  const [customText, setCustomText] = useState("");
  const [batchCount, setBatchCount] = useState<1 | 2 | 3 | 4>(1);

  // Comparison mode (extra models)
  const [extraModels, setExtraModels] = useState<Array<{ modelId: string; colorIdx: number }>>([]);

  // Prompt editing
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [editablePrompt, setEditablePrompt] = useState<string>("");
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  // Generation state
  const [status, setStatus] = useState<"idle" | "analyzing" | "drafting" | "finalizing" | "done">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [draftUrls, setDraftUrls] = useState<string[]>([]);
  const [finalUrls, setFinalUrls] = useState<string[]>([]);
  const [selectedDraftIdx, setSelectedDraftIdx] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Logo toggle
  const [showLogo, setShowLogo] = useState(true);

  // Copy library
  const [copyChips, setCopyChips] = useState<string[]>([]);
  const [showChipManager, setShowChipManager] = useState(false);
  const [newChipText, setNewChipText] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setHistory(loadHistory());
    setCopyChips(loadCopyChips());
  }, []);

  const insertChip = (chip: string) => {
    const separator = customText.trim() ? " " : "";
    setCustomText(customText + separator + chip);
    textareaRef.current?.focus();
  };

  const handleAddChip = () => {
    if (!newChipText.trim()) return;
    setCopyChips(addCopyChip(newChipText.trim()));
    setNewChipText("");
  };

  const handleRemoveChip = (chip: string) => {
    setCopyChips(removeCopyChip(chip));
  };

  const model = MODELS.find(m => m.id === selectedModelId)!;
  const selectedImg = model.images[selectedColorIdx] || model.images[0];
  const template = TEMPLATES.find(t => t.id === selectedTemplateId)!;
  const showPrice = priceMode !== "hide";

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setInspoPreview(URL.createObjectURL(file));
    setInspoMediaType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = (reader.result as string).split(",")[1];
      setInspoBase64(b64);
    };
    reader.readAsDataURL(file);
    setStep(2);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // Build prompt and go to review step
  const buildAndReview = async () => {
    setError(null);
    let prompt = "";
    if (mode === "template") {
      const additional = extraModels.map(em => {
        const m = MODELS.find(mm => mm.id === em.modelId)!;
        const img = m.images[em.colorIdx];
        return { label: m.label, color: img.color, tagline: m.tagline, price: m.price };
      });
      prompt = template.buildPrompt({
        modelLabel: model.label, color: selectedImg.color,
        tagline: model.tagline, cta: model.cta,
        showPrice, showLogo, price: model.price, priceMonthly: model.priceMonthly,
        customText, additionalModels: additional,
      });
    } else {
      // Inspiration mode - call Claude
      if (!inspoBase64) { setError("Nema referentne slike"); return; }
      setStatus("analyzing");
      setStatusMsg("Claude analizira inspiraciju...");
      try {
        const r = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: inspoBase64, mediaType: inspoMediaType,
            modelLabel: model.label, color: selectedImg.color,
            tagline: model.tagline, cta: model.cta,
            showPrice, showLogo, price: model.price, priceMonthly: model.priceMonthly,
            customText,
          }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Analiza nije uspela");
        prompt = d.prompt;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setStatus("idle");
        return;
      }
    }
    setGeneratedPrompt(prompt);
    setEditablePrompt(prompt);
    setStep(3);
    setStatus("idle");
  };

  // Generate draft (low quality)
  const generateDraft = async () => {
    setError(null);
    setStatus("drafting");
    setStatusMsg("Nano Banana 2 (draft)...");
    setDraftUrls([]);
    try {
      const mediaIds = [selectedImg.mediaId, ...extraModels.map(em => {
        const m = MODELS.find(mm => mm.id === em.modelId)!;
        return m.images[em.colorIdx].mediaId;
      })];

      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: editablePrompt, mediaIds, quality: "low", count: batchCount }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Draft nije uspeo");
      const jobId = d.id || d.job_id || d.jobId;
      const urls = await pollJob(jobId, setStatusMsg);
      setDraftUrls(urls);
      setSelectedDraftIdx(0);
      setStep(4);
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("idle");
    }
  };

  // Finalize selected draft (high quality)
  const finalize = async () => {
    setError(null);
    setStatus("finalizing");
    setStatusMsg("Generišem finalnu HIGH quality verziju...");
    setFinalUrls([]);
    try {
      const mediaIds = [selectedImg.mediaId, ...extraModels.map(em => {
        const m = MODELS.find(mm => mm.id === em.modelId)!;
        return m.images[em.colorIdx].mediaId;
      })];

      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: editablePrompt, mediaIds, quality: "high", count: 1 }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const jobId = d.id || d.job_id || d.jobId;
      const urls = await pollJob(jobId, setStatusMsg);
      setFinalUrls(urls);

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        modelId: selectedModelId,
        color: selectedImg.color,
        templateId: mode === "template" ? selectedTemplateId : "inspiration",
        showPrice, customText,
        prompt: editablePrompt,
        resultUrls: urls,
        additionalModels: extraModels.map(em => ({
          modelId: em.modelId,
          color: MODELS.find(mm => mm.id === em.modelId)!.images[em.colorIdx].color
        })),
        inspoPreview: mode === "inspiration" ? inspoPreview || undefined : undefined,
      };
      saveHistoryEntry(entry);
      setHistory([entry, ...history]);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("idle");
    }
  };

  const reset = () => {
    setInspoPreview(null); setInspoBase64(null);
    setDraftUrls([]); setFinalUrls([]); setError(null);
    setStep(1); setCustomText(""); setSelectedColorIdx(0);
    setStatus("idle"); setStatusMsg("");
    setExtraModels([]); setGeneratedPrompt(""); setEditablePrompt("");
    setShowPromptEditor(false);
  };

  const restoreFromHistory = (entry: HistoryEntry) => {
    setSelectedModelId(entry.modelId);
    const model = MODELS.find(m => m.id === entry.modelId)!;
    setSelectedColorIdx(model.images.findIndex(i => i.color === entry.color));
    if (entry.templateId !== "inspiration") {
      setMode("template");
      setSelectedTemplateId(entry.templateId);
    }
    setPriceMode(entry.showPrice ? "cash" : "hide");
    setCustomText(entry.customText);
    setEditablePrompt(entry.prompt);
    setGeneratedPrompt(entry.prompt);
    if (entry.additionalModels) {
      setExtraModels(entry.additionalModels.map(am => {
        const m = MODELS.find(mm => mm.id === am.modelId)!;
        return { modelId: am.modelId, colorIdx: m.images.findIndex(i => i.color === am.color) };
      }));
    }
    setTab("create");
    setStep(3);
  };

  const isLoading = status !== "idle" && status !== "done";
  const lbl = { display: "block" as const, fontSize: 10, color: "#333", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "1px" };

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", maxWidth: 480, margin: "0 auto" }}>

      {/* Header with tabs */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, background: BG, zIndex: 10 }}>
        <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 800, fontStyle: "italic", fontSize: 19 }}>
              <span style={{ color: Y }}>BEE</span>BIKE
            </span>
            <span style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "2px 8px", fontSize: 10, color: "#444", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Studio
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, padding: "0 20px" }}>
          {(["create", "history"] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === "create") { reset(); } }}
              style={{
                background: "none", border: "none", padding: "10px 0 12px", marginRight: 20,
                color: tab === t ? Y : "#333", fontSize: 13, fontWeight: 600, cursor: "pointer",
                borderBottom: `2px solid ${tab === t ? Y : "transparent"}`, textTransform: "capitalize",
              }}>
              {t === "create" ? "Kreiraj" : `Istorija (${history.length})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px 40px" }}>

        {/* CREATE TAB */}
        {tab === "create" && (
          <>
            {/* MODE SWITCH (visible on step 1) */}
            {step === 1 && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 20, background: CARD, padding: 4, borderRadius: 10, border: `1px solid ${BORDER}` }}>
                  {(["template", "inspiration"] as Mode[]).map(m => (
                    <button key={m} onClick={() => setMode(m)}
                      style={{
                        border: "none", padding: "9px 12px", borderRadius: 7, fontSize: 12,
                        cursor: "pointer", fontWeight: 600,
                        background: mode === m ? Y : "transparent",
                        color: mode === m ? "#000" : "#555",
                      }}>
                      {m === "template" ? "📐 Templates" : "🖼 Inspiracija"}
                    </button>
                  ))}
                </div>

                {mode === "template" && (
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>
                      Odaberi <span style={{ color: Y }}>template</span>
                    </h2>
                    <p style={{ color: "#333", fontSize: 12, margin: "0 0 16px" }}>
                      Gotovi layouti — najbrži put do story-ja
                    </p>
                    <div style={{ display: "grid", gap: 8 }}>
                      {TEMPLATES.map(t => (
                        <button key={t.id} onClick={() => { setSelectedTemplateId(t.id); setStep(2); }}
                          style={{
                            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
                            padding: "14px 16px", cursor: "pointer", textAlign: "left",
                            display: "flex", alignItems: "center", gap: 12,
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = Y)}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}>
                          <div style={{ fontSize: 24 }}>{t.emoji}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{t.label}</div>
                            <div style={{ color: "#444", fontSize: 11 }}>{t.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {mode === "inspiration" && (
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>
                      Prevuci <span style={{ color: Y }}>inspiraciju</span>
                    </h2>
                    <p style={{ color: "#333", fontSize: 12, margin: "0 0 16px" }}>
                      Claude analizira layout i pravi BeeBike verziju
                    </p>
                    <div
                      onDrop={onDrop}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onClick={() => fileRef.current?.click()}
                      style={{
                        border: `2px dashed ${dragOver ? Y : BORDER}`, borderRadius: 14,
                        padding: "50px 20px", textAlign: "center", cursor: "pointer",
                        background: dragOver ? "rgba(245,200,66,0.03)" : CARD,
                      }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>🖼</div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Prevuci ovde</div>
                      <div style={{ color: "#333", fontSize: 12 }}>ili klikni</div>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  </div>
                )}
              </>
            )}

            {/* STEP 2 — Config */}
            {step === 2 && (
              <div>
                {/* Preview + selected */}
                <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
                  {mode === "inspiration" && inspoPreview && (
                    <>
                      <div>
                        <div style={lbl}>Referenca</div>
                        <img src={inspoPreview} alt="" style={{ width: 60, aspectRatio: "9/16", objectFit: "cover", borderRadius: 8, border: `1px solid ${BORDER}` }} />
                      </div>
                      <div style={{ color: "#1e1e1e", fontSize: 18 }}>→</div>
                    </>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={lbl}>{mode === "template" ? "Template" : "Podešavanja"}</div>
                    {mode === "template" && (
                      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{template.emoji}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{template.label}</div>
                            <div style={{ fontSize: 10, color: "#444" }}>{template.description}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Model + preview */}
                <label style={lbl}>Model</label>
                <select value={selectedModelId} onChange={e => { setSelectedModelId(e.target.value); setSelectedColorIdx(0); }}
                  style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, color: "#ddd", padding: "10px 12px", fontSize: 13, marginBottom: 12, cursor: "pointer" }}>
                  {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>

                {/* Color selector with preview */}
                <label style={lbl}>Boja · Preview</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 6, marginBottom: 20 }}>
                  {model.images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedColorIdx(i)}
                      style={{
                        padding: 6, borderRadius: 8, cursor: "pointer",
                        border: `1.5px solid ${selectedColorIdx === i ? Y : BORDER}`,
                        background: selectedColorIdx === i ? "rgba(245,200,66,0.08)" : CARD,
                      }}>
                      <img src={img.previewUrl} alt={img.color}
                        style={{ width: "100%", height: 44, objectFit: "contain", borderRadius: 4, background: "#000", marginBottom: 4 }} />
                      <div style={{ fontSize: 10, color: selectedColorIdx === i ? Y : "#666", fontWeight: 500 }}>{img.color}</div>
                    </button>
                  ))}
                </div>

                {/* Comparison template — extra models */}
                {template.isMultiModel && mode === "template" && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={lbl}>Dodatni modeli za poređenje</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {extraModels.map((em, idx) => {
                        const m = MODELS.find(mm => mm.id === em.modelId)!;
                        return (
                          <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <select value={em.modelId} onChange={e => {
                              const newExtra = [...extraModels];
                              newExtra[idx] = { modelId: e.target.value, colorIdx: 0 };
                              setExtraModels(newExtra);
                            }}
                              style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 7, color: "#ddd", padding: "8px 10px", fontSize: 12 }}>
                              {MODELS.filter(mm => mm.id !== selectedModelId).map(mm => <option key={mm.id} value={mm.id}>{mm.label}</option>)}
                            </select>
                            <select value={em.colorIdx} onChange={e => {
                              const newExtra = [...extraModels];
                              newExtra[idx] = { ...em, colorIdx: parseInt(e.target.value) };
                              setExtraModels(newExtra);
                            }}
                              style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 7, color: "#ddd", padding: "8px 10px", fontSize: 12 }}>
                              {m.images.map((im, i) => <option key={i} value={i}>{im.color}</option>)}
                            </select>
                            <button onClick={() => setExtraModels(extraModels.filter((_, i) => i !== idx))}
                              style={{ background: "none", border: `1px solid ${BORDER}`, color: "#666", borderRadius: 6, padding: "8px 10px", cursor: "pointer", fontSize: 12 }}>×</button>
                          </div>
                        );
                      })}
                      {extraModels.length < 2 && (
                        <button onClick={() => {
                          const other = MODELS.find(mm => mm.id !== selectedModelId && !extraModels.some(em => em.modelId === mm.id));
                          if (other) setExtraModels([...extraModels, { modelId: other.id, colorIdx: 0 }]);
                        }}
                          style={{ background: "none", border: `1px dashed ${BORDER}`, color: "#555", borderRadius: 7, padding: "8px", cursor: "pointer", fontSize: 12 }}>
                          + Dodaj model
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Price mode */}
                <label style={lbl}>Prikaz cene</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 20 }}>
                  {([
                    { id: "hide", label: "Bez cene" },
                    { id: "cash", label: `${model.price?.toLocaleString()} RSD` },
                  ] as { id: PriceMode; label: string }[]).map(p => (
                    <button key={p.id} onClick={() => setPriceMode(p.id)}
                      style={{
                        padding: "10px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: priceMode === p.id ? 600 : 400,
                        border: `1.5px solid ${priceMode === p.id ? Y : BORDER}`,
                        background: priceMode === p.id ? "rgba(245,200,66,0.08)" : CARD,
                        color: priceMode === p.id ? Y : "#666",
                      }}>{p.label}</button>
                  ))}
                </div>

                {/* Logo toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Prikaži BeeBike logo</div>
                    <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{showLogo ? "Gore-levo, mali wordmark" : "Bez loga na story-ju"}</div>
                  </div>
                  <div onClick={() => setShowLogo(!showLogo)} style={{ width: 40, height: 22, borderRadius: 11, cursor: "pointer", background: showLogo ? Y : "#1a1a1a", position: "relative", transition: "background 0.2s" }}>
                    <div style={{ position: "absolute", top: 3, left: showLogo ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: showLogo ? "#000" : "#444", transition: "left 0.2s" }} />
                  </div>
                </div>

                {/* Custom text */}
                <label style={lbl}>Dodatni tekst (opciono)</label>
                <textarea ref={textareaRef} value={customText} onChange={e => setCustomText(e.target.value)}
                  placeholder="Klikni chip ispod ili kucaj ovde..."
                  style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, color: "#ccc", padding: "10px 12px", fontSize: 12, resize: "none", height: 60, marginBottom: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />

                {/* Copy chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                  {copyChips.map((chip, i) => (
                    <button key={i} onClick={() => insertChip(chip)}
                      style={{
                        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
                        padding: "5px 10px", fontSize: 11, color: "#888", cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = Y; e.currentTarget.style.color = Y; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#888"; }}>
                      + {chip}
                    </button>
                  ))}
                  <button onClick={() => setShowChipManager(!showChipManager)}
                    style={{ background: "none", border: `1px dashed ${BORDER}`, borderRadius: 12, padding: "5px 10px", fontSize: 11, color: "#555", cursor: "pointer" }}>
                    ⚙ Uredi
                  </button>
                </div>

                {/* Chip manager */}
                {showChipManager && (
                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: "1px" }}>Upravljanje frazama</div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      <input value={newChipText} onChange={e => setNewChipText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAddChip()}
                        placeholder="Nova fraza..."
                        style={{ flex: 1, background: "#0a0a0a", border: `1px solid ${BORDER}`, borderRadius: 6, color: "#ccc", padding: "7px 10px", fontSize: 12, outline: "none" }} />
                      <button onClick={handleAddChip}
                        style={{ background: Y, color: "#000", border: "none", borderRadius: 6, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+</button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {copyChips.map((chip, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#0a0a0a", borderRadius: 10, padding: "3px 4px 3px 10px", fontSize: 11, color: "#666" }}>
                          {chip}
                          <button onClick={() => handleRemoveChip(chip)}
                            style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: "0 4px" }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!showChipManager && <div style={{ marginBottom: 16 }} />}

                {/* Live preview */}
                <label style={lbl}>Preview (kako će izgledati)</label>
                <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 120, flexShrink: 0 }}>
                    <StoryPreview
                      model={model} img={selectedImg} template={template}
                      showPrice={showPrice} showLogo={showLogo} customText={customText}
                      extraModels={extraModels.map(em => {
                        const m = MODELS.find(mm => mm.id === em.modelId)!;
                        return { model: m, img: m.images[em.colorIdx] };
                      })}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: "#444", lineHeight: 1.6, paddingTop: 4 }}>
                    <div style={{ marginBottom: 6 }}>Ovo je približna skica finalnog story-ja. AI će je detaljno realizovati sa pravom pozadinom, senkama i tipografijom.</div>
                    <div style={{ color: "#666" }}>Preview se menja u realnom vremenu kako podešavaš opcije.</div>
                  </div>
                </div>

                {/* Batch */}
                <label style={lbl}>Broj varijanti drafta</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 20 }}>
                  {[1, 2, 3, 4].map(n => (
                    <button key={n} onClick={() => setBatchCount(n as 1|2|3|4)}
                      style={{
                        padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        border: `1.5px solid ${batchCount === n ? Y : BORDER}`,
                        background: batchCount === n ? "rgba(245,200,66,0.08)" : CARD,
                        color: batchCount === n ? Y : "#666",
                      }}>{n}×</button>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: "#333", marginBottom: 20, marginTop: -12 }}>
                  Više varijanti = više kredita ali veći izbor
                </div>

                {error && (
                  <div style={{ background: "rgba(255,50,50,0.06)", border: "1px solid rgba(255,50,50,0.15)", borderRadius: 8, padding: "10px 14px", color: "#ff6b6b", fontSize: 12, marginBottom: 14 }}>
                    ⚠ {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setStep(1)}
                    style={{ background: CARD, color: "#666", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "13px 16px", fontSize: 13, cursor: "pointer" }}>
                    ←
                  </button>
                  <button onClick={buildAndReview} disabled={isLoading}
                    style={{
                      flex: 1, border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700,
                      cursor: isLoading ? "not-allowed" : "pointer",
                      background: isLoading ? "#111" : Y, color: isLoading ? "#444" : "#000",
                    }}>
                    {isLoading ? "⏳ " + statusMsg : "Sledeći korak →"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — Review prompt & generate draft */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>
                  Pregled i <span style={{ color: Y }}>draft</span>
                </h3>

                <button onClick={() => setShowPromptEditor(!showPromptEditor)}
                  style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: "#888", fontSize: 12, cursor: "pointer", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>📝 {showPromptEditor ? "Sakri" : "Prikaži"} prompt (možeš da menjaš)</span>
                  <span>{showPromptEditor ? "▲" : "▼"}</span>
                </button>

                {showPromptEditor && (
                  <textarea value={editablePrompt} onChange={e => setEditablePrompt(e.target.value)}
                    style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, color: "#aaa", padding: "12px", fontSize: 11, height: 200, marginBottom: 12, fontFamily: "monospace", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }} />
                )}

                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#444", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>Šta ćeš dobiti</div>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: Y }}>{model.label}</span> · {selectedImg.color}
                    {extraModels.length > 0 && <span style={{ color: "#666" }}> + {extraModels.length} modela za poređenje</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    {mode === "template" ? `Template: ${template.label}` : "Iz inspiracije"} · {batchCount}× draft · {showPrice ? "sa cenom" : "bez cene"}
                  </div>
                </div>

                <div style={{ background: "rgba(245,200,66,0.03)", border: "1px solid rgba(245,200,66,0.15)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#888" }}>
                  💡 Draft je LOW quality (~3-5 kredita). Final HIGH kvalitet ide tek kad odobriš.
                </div>

                {error && (
                  <div style={{ background: "rgba(255,50,50,0.06)", border: "1px solid rgba(255,50,50,0.15)", borderRadius: 8, padding: "10px 14px", color: "#ff6b6b", fontSize: 12, marginBottom: 14 }}>
                    ⚠ {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setStep(2)}
                    style={{ background: CARD, color: "#666", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "13px 16px", fontSize: 13, cursor: "pointer" }}>
                    ←
                  </button>
                  <button onClick={generateDraft} disabled={isLoading}
                    style={{
                      flex: 1, border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700,
                      cursor: isLoading ? "not-allowed" : "pointer",
                      background: isLoading ? "#111" : Y, color: isLoading ? "#444" : "#000",
                    }}>
                    {status === "drafting" ? "⏳ " + statusMsg : `⚡ Generiši ${batchCount}× draft`}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 — Draft results, pick and finalize */}
            {step === 4 && (
              <div>
                {finalUrls.length === 0 ? (
                  <>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>
                      Odaberi <span style={{ color: Y }}>draft</span>
                    </h3>
                    <p style={{ color: "#444", fontSize: 12, margin: "0 0 16px" }}>
                      Ako je dobar — finalizuj u HIGH quality. Ako nije — vrati se korak nazad.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: draftUrls.length > 1 ? "1fr 1fr" : "1fr", gap: 8, marginBottom: 16 }}>
                      {draftUrls.map((url, i) => (
                        <button key={i} onClick={() => setSelectedDraftIdx(i)}
                          style={{
                            padding: 4, borderRadius: 12,
                            border: `2px solid ${selectedDraftIdx === i ? Y : BORDER}`,
                            background: selectedDraftIdx === i ? "rgba(245,200,66,0.05)" : "transparent",
                            cursor: "pointer",
                          }}>
                          <img src={url} alt={`Draft ${i + 1}`}
                            style={{ width: "100%", borderRadius: 8, display: "block" }} />
                          <div style={{ fontSize: 10, color: selectedDraftIdx === i ? Y : "#444", marginTop: 6, fontWeight: 600 }}>
                            Draft {i + 1} {selectedDraftIdx === i && "✓"}
                          </div>
                        </button>
                      ))}
                    </div>

                    {error && (
                      <div style={{ background: "rgba(255,50,50,0.06)", border: "1px solid rgba(255,50,50,0.15)", borderRadius: 8, padding: "10px 14px", color: "#ff6b6b", fontSize: 12, marginBottom: 14 }}>
                        ⚠ {error}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setStep(3)}
                        style={{ background: CARD, color: "#666", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "13px 16px", fontSize: 13, cursor: "pointer" }}>
                        ← Prompt
                      </button>
                      <button onClick={finalize} disabled={isLoading}
                        style={{
                          flex: 1, border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700,
                          cursor: isLoading ? "not-allowed" : "pointer",
                          background: isLoading ? "#111" : Y, color: isLoading ? "#444" : "#000",
                        }}>
                        {status === "finalizing" ? "⏳ " + statusMsg : "✨ Finalizuj u HIGH quality"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={lbl}>Finalna verzija</div>
                    <img src={finalUrls[0]} alt="Final"
                      style={{ width: "100%", borderRadius: 12, border: `1px solid ${BORDER}`, marginBottom: 12 }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <a href={finalUrls[0]} download="beebike-story.jpg" target="_blank" rel="noopener noreferrer"
                        style={{ display: "block", textAlign: "center", background: Y, color: "#000", borderRadius: 10, padding: "13px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                        ↓ Preuzmi
                      </a>
                      <button onClick={reset}
                        style={{ background: CARD, color: "#888", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "13px", fontSize: 13, cursor: "pointer" }}>
                        + Novi story
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#333" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 14 }}>Nema istorije još</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Generiši prvi story i pojaviće se ovde</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {history.map(entry => {
                  const m = MODELS.find(mm => mm.id === entry.modelId);
                  const t = TEMPLATES.find(tt => tt.id === entry.templateId);
                  return (
                    <div key={entry.id}
                      style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 8 }}>
                      {entry.resultUrls[0] && (
                        <img src={entry.resultUrls[0]} alt="" style={{ width: "100%", borderRadius: 6, marginBottom: 8, aspectRatio: "9/16", objectFit: "cover" }} />
                      )}
                      <div style={{ fontSize: 12, fontWeight: 600, color: Y, marginBottom: 2 }}>{m?.label}</div>
                      <div style={{ fontSize: 10, color: "#555" }}>
                        {entry.color} · {t?.label || "Inspiracija"}
                      </div>
                      <div style={{ fontSize: 9, color: "#333", marginTop: 4 }}>
                        {new Date(entry.timestamp).toLocaleDateString("sr-RS", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                        <button onClick={() => restoreFromHistory(entry)}
                          style={{ flex: 1, background: "rgba(245,200,66,0.1)", color: Y, border: "none", borderRadius: 5, padding: "6px", fontSize: 10, cursor: "pointer", fontWeight: 600 }}>
                          ↻ Ponovi
                        </button>
                        <button onClick={() => { deleteHistoryEntry(entry.id); setHistory(loadHistory()); }}
                          style={{ background: "none", border: `1px solid ${BORDER}`, color: "#444", borderRadius: 5, padding: "6px 8px", fontSize: 10, cursor: "pointer" }}>×</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
