"use client";

import { BeeBikeModel, ModelImage } from "@/lib/models";
import { Template } from "@/lib/templates";

interface StoryPreviewProps {
  model: BeeBikeModel;
  img: ModelImage;
  template: Template;
  showPrice: boolean;
  showLogo: boolean;
  customText: string;
  extraModels?: Array<{ model: BeeBikeModel; img: ModelImage }>;
}

const Y = "#F5C842";

export default function StoryPreview({ model, img, template, showPrice, showLogo, customText, extraModels = [] }: StoryPreviewProps) {
  // Layout varijante po template ID-ju
  const renderLayout = () => {
    switch (template.id) {
      case "hero":
        return <HeroLayout />;
      case "collage":
        return <CollageLayout />;
      case "price":
        return <PriceLayout />;
      case "lifestyle":
        return <LifestyleLayout />;
      case "comparison":
        return <ComparisonLayout />;
      case "minimal":
        return <MinimalLayout />;
      default:
        return <HeroLayout />;
    }
  };

  const Logo = () => showLogo ? (
    <div style={{ position: "absolute", top: 12, left: 12, fontWeight: 800, fontStyle: "italic", fontSize: 11, letterSpacing: "-0.3px", zIndex: 5 }}>
      <span style={{ color: Y }}>BEE</span>
      <span style={{ color: "#fff" }}>BIKE</span>
    </div>
  ) : null;

  // ─── HERO LAYOUT ───
  const HeroLayout = () => (
    <>
      <Logo />
      {/* Massive title top-center */}
      <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center", padding: "0 20px", zIndex: 4 }}>
        <div style={{ fontStyle: "italic", fontWeight: 900, fontSize: 32, color: Y, letterSpacing: "-1px", lineHeight: 1, textTransform: "uppercase" }}>
          {model.label.split(" ").map((w, i) => <div key={i}>{w}</div>)}
        </div>
      </div>
      {/* Product center */}
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: "70%", height: "35%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={img.previewUrl} alt={img.color}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.6))" }} />
      </div>
      {/* Bottom text */}
      <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", padding: "0 16px" }}>
        <div style={{ color: "#fff", fontStyle: "italic", fontSize: 11, marginBottom: 8 }}>&quot;{model.tagline}&quot;</div>
        {showPrice && model.price && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>{model.price.toLocaleString()} RSD</div>
            <div style={{ color: Y, fontSize: 10, fontWeight: 600, marginTop: 2 }}>
              × 24 rate: {model.priceMonthly?.toLocaleString()} RSD/mes
            </div>
          </div>
        )}
        <div style={{ border: "1.5px solid #fff", borderRadius: 4, padding: "6px 12px", display: "inline-block", fontSize: 9, fontWeight: 700, letterSpacing: "0.5px" }}>
          {model.cta}
        </div>
        {customText && (
          <div style={{ color: "#888", fontSize: 8, marginTop: 8, fontStyle: "italic" }}>{customText}</div>
        )}
      </div>
    </>
  );

  // ─── COLLAGE ───
  const CollageLayout = () => (
    <>
      <Logo />
      {/* 3 detail panels top */}
      <div style={{ position: "absolute", top: 30, left: 12, right: 12, height: "30%", display: "flex", gap: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, background: "#0f0f0f", border: "1px solid #222", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", transform: i === 1 ? "translateY(4px)" : "" }}>
            <img src={img.previewUrl} alt="" style={{ width: "150%", height: "150%", objectFit: "cover", opacity: 0.9 }} />
          </div>
        ))}
      </div>
      {/* Hero product */}
      <div style={{ position: "absolute", top: "42%", left: "50%", transform: "translate(-50%, 0)", width: "75%", height: "30%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={img.previewUrl} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
      </div>
      {/* Bottom title + tagline */}
      <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center", padding: "0 12px" }}>
        <div style={{ fontStyle: "italic", fontWeight: 900, fontSize: 26, color: Y, letterSpacing: "-0.5px", lineHeight: 1, marginBottom: 6, textTransform: "uppercase" }}>
          {model.label}
        </div>
        <div style={{ color: "#ccc", fontSize: 9, fontStyle: "italic", marginBottom: 6 }}>{model.tagline}</div>
        {showPrice && (
          <div style={{ color: "#fff", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>{model.price?.toLocaleString()} RSD</div>
        )}
        <div style={{ border: "1px solid #fff", borderRadius: 3, padding: "4px 10px", display: "inline-block", fontSize: 8, fontWeight: 700 }}>
          {model.cta}
        </div>
      </div>
    </>
  );

  // ─── PRICE ───
  const PriceLayout = () => (
    <>
      <Logo />
      {/* Left: product */}
      <div style={{ position: "absolute", top: "20%", left: 0, width: "48%", height: "60%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={img.previewUrl} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
      </div>
      {/* Right: price info */}
      <div style={{ position: "absolute", top: "22%", right: 12, width: "48%", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ color: Y, fontSize: 12, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>{model.label}</div>
        {showPrice && model.price && (
          <>
            <div style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 0.9 }}>
              {model.price.toLocaleString()}
              <div style={{ fontSize: 10, marginTop: 2 }}>RSD</div>
            </div>
            <div style={{ color: "#666", fontSize: 8, fontStyle: "italic" }}>ili</div>
            <div>
              <div style={{ color: Y, fontSize: 14, fontWeight: 800 }}>{model.priceMonthly?.toLocaleString()} RSD</div>
              <div style={{ color: Y, fontSize: 8, fontWeight: 500 }}>× 24 rate</div>
            </div>
          </>
        )}
        <div style={{ color: "#ccc", fontSize: 9, fontStyle: "italic", marginTop: 8 }}>&quot;{model.tagline}&quot;</div>
      </div>
      {/* Bottom CTA */}
      <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ background: Y, color: "#000", borderRadius: 4, padding: "8px 16px", display: "inline-block", fontSize: 10, fontWeight: 800 }}>
          {model.cta}
        </div>
        {customText && (
          <div style={{ color: "#888", fontSize: 8, marginTop: 6, fontStyle: "italic" }}>{customText}</div>
        )}
      </div>
    </>
  );

  // ─── LIFESTYLE ───
  const LifestyleLayout = () => (
    <>
      {/* Background gradient simulating urban night */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, #1a1a2e 0%, #060606 70%)" }} />
      <Logo />
      <div style={{ position: "absolute", top: 20, right: 12, color: "#888", fontSize: 8, letterSpacing: "2px", textTransform: "uppercase" }}>
        BEEBIKE {model.label}
      </div>
      {/* Product */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, 0)", width: "80%", height: "40%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={img.previewUrl} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.9))" }} />
      </div>
      {/* Bottom */}
      <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", padding: "0 16px" }}>
        <div style={{ fontStyle: "italic", fontWeight: 900, fontSize: 28, color: Y, letterSpacing: "-0.5px", lineHeight: 1, marginBottom: 8, textTransform: "uppercase" }}>
          {model.label}
        </div>
        <div style={{ color: "#fff", fontSize: 10, fontStyle: "italic", marginBottom: 8 }}>{model.tagline}</div>
        {showPrice && (
          <div style={{ color: "#fff", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{model.price?.toLocaleString()} RSD</div>
        )}
        <div style={{ border: "1.5px solid #fff", borderRadius: 3, padding: "5px 11px", display: "inline-block", fontSize: 9, fontWeight: 700 }}>
          {model.cta}
        </div>
      </div>
    </>
  );

  // ─── COMPARISON ───
  const ComparisonLayout = () => {
    const all = [{ model, img }, ...extraModels];
    return (
      <>
        <Logo />
        {/* Top title */}
        <div style={{ position: "absolute", top: 36, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ color: Y, fontWeight: 900, fontSize: 18, letterSpacing: "-0.5px", textTransform: "uppercase" }}>
            IZABERI SVOJ
          </div>
        </div>
        {/* Panels */}
        <div style={{ position: "absolute", top: "22%", left: 8, right: 8, height: "60%", display: "flex", gap: 4 }}>
          {all.map((it, i) => (
            <div key={i} style={{ flex: 1, background: "#0a0a0a", border: "1px solid #222", borderRadius: 4, padding: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
                <img src={it.img.previewUrl} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ color: Y, fontSize: 9, fontWeight: 800, textAlign: "center", lineHeight: 1.1 }}>{it.model.label}</div>
              {showPrice && (
                <div style={{ color: "#fff", fontSize: 9, fontWeight: 700 }}>{it.model.price?.toLocaleString()} RSD</div>
              )}
              <div style={{ color: "#888", fontSize: 7, fontStyle: "italic", textAlign: "center" }}>{it.model.tagline}</div>
            </div>
          ))}
        </div>
        {/* Bottom */}
        <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ border: "1.5px solid #fff", borderRadius: 3, padding: "6px 14px", display: "inline-block", fontSize: 9, fontWeight: 700 }}>
            PORUČI DANAS
          </div>
        </div>
      </>
    );
  };

  // ─── MINIMAL ───
  const MinimalLayout = () => (
    <>
      <Logo />
      <div style={{ position: "absolute", top: 20, right: 12, color: Y, fontSize: 9, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" }}>
        {model.label}
      </div>
      {/* Product big center */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, 0)", width: "80%", height: "55%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={img.previewUrl} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.7))" }} />
      </div>
      {/* Bottom */}
      <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", padding: "0 16px" }}>
        <div style={{ fontStyle: "italic", fontWeight: 900, fontSize: 30, color: Y, letterSpacing: "-1px", lineHeight: 1, marginBottom: 8, textTransform: "uppercase" }}>
          {model.label}
        </div>
        <div style={{ height: 1, background: "#333", margin: "0 auto 8px", width: "40%" }} />
        <div style={{ color: "#ccc", fontSize: 9, fontStyle: "italic", marginBottom: 10 }}>{model.tagline}</div>
        {showPrice && (
          <div style={{ color: "#fff", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{model.price?.toLocaleString()} RSD</div>
        )}
        <div style={{ border: "1px solid #fff", borderRadius: 3, padding: "5px 11px", display: "inline-block", fontSize: 9, fontWeight: 700 }}>
          {model.cta}
        </div>
      </div>
    </>
  );

  return (
    <div style={{
      position: "relative", width: "100%", aspectRatio: "9/16",
      background: "#060606", borderRadius: 10, border: "1px solid #1a1a1a",
      overflow: "hidden", fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {renderLayout()}
      {/* Preview badge */}
      <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "#888", fontSize: 8, padding: "2px 6px", borderRadius: 3, letterSpacing: "0.5px", textTransform: "uppercase" }}>
        Preview
      </div>
    </div>
  );
}
