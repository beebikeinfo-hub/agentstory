"use client";

import { useState, useRef, useCallback } from "react";
import { MODELS, BeeBikeModel, ModelImage } from "@/lib/models";

const Y = "#F5C842";

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [inspoPreview, setInspoPreview] = useState<string | null>(null);
  const [inspoBase64, setInspoBase64] = useState<string | null>(null);
  const [inspoMediaType, setInspoMediaType] = useState<string>("image/jpeg");

  const [selectedModelId, setSelectedModelId] = useState("cappuccino");
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [showPrice, setShowPrice] = useState(false);
  const [customText, setCustomText] = useState("");

  const [status, setStatus] = useState<"idle" | "analyzing" | "generating" | "done">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const model = MODELS.find(m => m.id === selectedModelId)!;
  const selectedImg = model.images[selectedColorIdx] || model.images[0];

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setInspoPreview(URL.createObjectURL(file));
    setInspoMediaType(file.type as string);
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = (reader.result as string).split(",")[1];
      setInspoBase64(b64);
    };
    reader.readAsDataURL(file);
    setStep(2);
    setResultUrl(null);
    setError(null);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const generate = async () => {
    if (!inspoBase64) return;
    setError(null);
    setResultUrl(null);

    try {
      // 1. Claude analizira inspiraciju
      setStatus("analyzing");
      setStatusMsg("Claude analizira inspiraciju...");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: inspoBase64,
          mediaType: inspoMediaType,
          modelLabel: model.label,
          color: selectedImg.color,
          tagline: model.tagline,
          cta: model.cta,
          showPrice,
          price: model.price,
          priceMonthly: model.priceMonthly,
          customText,
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Greška pri analizi");
      const prompt = analyzeData.prompt;

      // 2. Higgsfield generiše story
      setStatus("generating");
      setStatusMsg("Nano Banana 2 generiše story...");

      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mediaId: selectedImg.mediaId }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || "Greška pri generaciji");

      const jobId = genData.id || genData.job_id || genData.jobId;
      if (!jobId) throw new Error("Nema job ID: " + JSON.stringify(genData));

      // 3. Polling
      setStatusMsg("Čekam rezultat...");
      let attempts = 0;
      const poll = async (): Promise<void> => {
        attempts++;
        if (attempts > 80) throw new Error("Timeout — pokušaj ponovo");

        const statusRes = await fetch(`/api/status/${jobId}`);
        const s = await statusRes.json();
        const st = (s.status || s.state || "").toLowerCase();

        if (st === "completed" || st === "succeeded" || st === "success") {
          const url = s.output?.[0] || s.result?.url || s.url || s.image_url;
          if (url) { setResultUrl(url); setStep(3); setStatus("done"); return; }
        }
        if (st === "failed" || st === "error") throw new Error("Generacija nije uspela");

        await new Promise(r => setTimeout(r, 3000));
        return poll();
      };

      await poll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nepoznata greška");
      setStatus("idle");
    }
  };

  const reset = () => {
    setInspoPreview(null); setInspoBase64(null);
    setResultUrl(null); setError(null);
    setStep(1); setCustomText(""); setSelectedColorIdx(0);
    setStatus("idle"); setStatusMsg("");
  };

  const lbl = { display: "block" as const, fontSize: 10, color: "#333", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "1px" };
  const isLoading = status === "analyzing" || status === "generating";

  return (
    <div style={{ background: "#060606", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: 480, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #111", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#060606", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 800, fontStyle: "italic", fontSize: 20 }}>
            <span style={{ color: Y }}>BEE</span>BIKE
          </span>
          <span style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 4, padding: "2px 8px", fontSize: 10, color: "#444", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Story Agent
          </span>
        </div>
        {step > 1 && !isLoading && (
          <button onClick={reset} style={{ background: "none", border: "1px solid #1a1a1a", color: "#444", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer" }}>
            ← Nova
          </button>
        )}
      </div>

      {/* Steps */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: 4 }}>
        {["Inspiracija", "Podešavanja", "Rezultat"].map((label, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: step > i + 1 ? Y : step === i + 1 ? Y : "#111",
              border: `1.5px solid ${step >= i + 1 ? Y : "#1a1a1a"}`,
              color: step >= i + 1 ? "#000" : "#333",
            }}>{i + 1}</div>
            <span style={{ fontSize: 11, color: step === i + 1 ? "#aaa" : "#2a2a2a" }}>{label}</span>
            {i < 2 && <div style={{ width: 12, height: 1, background: "#1a1a1a", margin: "0 2px" }} />}
          </div>
        ))}
      </div>

      <div style={{ padding: "8px 20px 40px" }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>
              Prevuci <span style={{ color: Y }}>inspiraciju</span>
            </h2>
            <p style={{ color: "#333", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 }}>
              Bilo koji story, poster, ad — Claude analizira strukturu i Higgsfield generiše BeeBike verziju.
            </p>
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? Y : "#1a1a1a"}`, borderRadius: 16,
                padding: "60px 24px", textAlign: "center", cursor: "pointer",
                background: dragOver ? "rgba(245,200,66,0.03)" : "#0a0a0a", transition: "border-color 0.15s",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🖼</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Prevuci ovde</div>
              <div style={{ color: "#333", fontSize: 12 }}>ili klikni — JPG · PNG · WEBP</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "flex-end" }}>
              <div>
                <div style={lbl}>Referenca</div>
                <img src={inspoPreview!} alt="" style={{ width: 80, aspectRatio: "9/16", objectFit: "cover", borderRadius: 10, border: "1px solid #1a1a1a" }} />
              </div>
              <div style={{ color: "#1e1e1e", fontSize: 22, paddingBottom: 10 }}>→</div>
              <div style={{ flex: 1 }}>
                <div style={lbl}>Model · Boja</div>
                <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, padding: "12px", height: 114, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: Y }}>{model.label}</div>
                  <div style={{ fontSize: 12, color: "#444", marginTop: 3 }}>{selectedImg.color}</div>
                  <div style={{ fontSize: 11, color: "#2a2a2a", marginTop: 4, fontStyle: "italic" }}>"{model.tagline}"</div>
                </div>
              </div>
            </div>

            <label style={lbl}>Model</label>
            <select value={selectedModelId} onChange={e => { setSelectedModelId(e.target.value); setSelectedColorIdx(0); }}
              style={{ width: "100%", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, color: "#ddd", padding: "10px 12px", fontSize: 13, marginBottom: 16, cursor: "pointer" }}>
              {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>

            <label style={lbl}>Boja</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {model.images.map((img: ModelImage, i: number) => (
                <button key={i} onClick={() => setSelectedColorIdx(i)} style={{
                  padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: selectedColorIdx === i ? 600 : 400,
                  border: `1.5px solid ${selectedColorIdx === i ? Y : "#1a1a1a"}`,
                  background: selectedColorIdx === i ? "rgba(245,200,66,0.08)" : "#0a0a0a",
                  color: selectedColorIdx === i ? Y : "#555",
                }}>{img.color}</button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Prikaži cenu</div>
                {showPrice && model.price && (
                  <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{model.price.toLocaleString()} RSD · {model.priceMonthly?.toLocaleString()} RSD/mes</div>
                )}
              </div>
              <div onClick={() => setShowPrice(!showPrice)} style={{ width: 44, height: 24, borderRadius: 12, cursor: "pointer", background: showPrice ? Y : "#1a1a1a", position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 3, left: showPrice ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: showPrice ? "#000" : "#444", transition: "left 0.2s" }} />
              </div>
            </div>

            <label style={lbl}>Dodatni tekst (opciono)</label>
            <textarea value={customText} onChange={e => setCustomText(e.target.value)}
              placeholder="npr. 'Bez registracije. Bez dozvole.' ili 'Besplatna dostava u Srbiji'"
              style={{ width: "100%", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, color: "#ccc", padding: "10px 12px", fontSize: 12, resize: "none", height: 70, marginBottom: 20, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />

            {error && (
              <div style={{ background: "rgba(255,50,50,0.06)", border: "1px solid rgba(255,50,50,0.15)", borderRadius: 8, padding: "10px 14px", color: "#ff6b6b", fontSize: 12, marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            <button onClick={generate} disabled={isLoading} style={{
              width: "100%", border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              background: isLoading ? "#111" : Y, color: isLoading ? "#444" : "#000", transition: "all 0.15s",
            }}>
              {isLoading ? "⏳ " + statusMsg : "⚡ Generiši story"}
            </button>

            {isLoading && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: status === "analyzing" ? Y : "#2a2a2a" }} />
                  <span style={{ fontSize: 12, color: status === "analyzing" ? "#aaa" : "#2a2a2a" }}>Claude analizira inspiraciju</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: status === "generating" ? Y : "#2a2a2a" }} />
                  <span style={{ fontSize: 12, color: status === "generating" ? "#aaa" : "#2a2a2a" }}>Nano Banana 2 generiše story</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && resultUrl && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={lbl}>Generisani story</div>
              <img src={resultUrl} alt="Generated" style={{ width: "100%", borderRadius: 12, border: "1px solid #1a1a1a" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <a href={resultUrl} download="beebike-story.jpg" target="_blank" rel="noopener noreferrer"
                style={{ display: "block", textAlign: "center", background: Y, color: "#000", borderRadius: 10, padding: "13px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                ↓ Preuzmi
              </a>
              <button onClick={() => { setStep(2); setResultUrl(null); setStatus("idle"); }}
                style={{ background: "#0a0a0a", color: "#888", border: "1px solid #1a1a1a", borderRadius: 10, padding: "13px", fontSize: 13, cursor: "pointer" }}>
                ↺ Ponovi
              </button>
            </div>
            <button onClick={reset} style={{ width: "100%", background: "none", color: "#333", border: "1px solid #1a1a1a", borderRadius: 10, padding: "11px", fontSize: 13, cursor: "pointer" }}>
              + Nova inspiracija
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
