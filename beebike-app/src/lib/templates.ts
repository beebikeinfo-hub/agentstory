export interface Template {
  id: string;
  label: string;
  description: string;
  emoji: string;
  buildPrompt: (opts: TemplateOpts) => string;
  isMultiModel?: boolean;
}

export interface TemplateOpts {
  modelLabel: string;
  color: string;
  tagline: string;
  cta: string;
  showPrice: boolean;
  showLogo: boolean;
  price?: number;
  priceMonthly?: number;
  customText: string;
  additionalModels?: Array<{ label: string; color: string; tagline: string; price?: number }>;
}

const brand = (showLogo: boolean) => `BRAND: BeeBike žuta #F5C842 samo za naziv modela. Crna pozadina #080808. Bela za ostali tekst.${
  showLogo ? ` BeeBike logo gore-levo: "BEE" žuto italic + "BIKE" belo italic, malo.` : ` BEZ LOGA.`
}`;

const CRITICAL = `KRITIČNO PRAVILO: Slika proizvoda mora biti IDENTIČNA referentnoj slici. Ne menjati dizajn, oblik, proporcije ni boju.`;

const price = (o: TemplateOpts) =>
  o.showPrice && o.price
    ? `CENA prikazuje se veliko: "${o.price.toLocaleString()} RSD" bold belo, ispod manja žuta: "× 24 rate: ${o.priceMonthly?.toLocaleString()} RSD/mes"`
    : "";

const customTextBlock = (o: TemplateOpts) => (o.customText ? `\nDODATNO: ${o.customText}` : "");

export const TEMPLATES: Template[] = [
  {
    id: "hero",
    label: "Hero Shot",
    emoji: "🎯",
    description: "Klasičan poster — model u centru, naslov gore, CTA dole",
    buildPrompt: (o) => `Instagram Story 9:16 vertical, 1080x1920px. Hero shot poster za BeeBike ${o.modelLabel}.

${CRITICAL}

BACKGROUND: Deep dark cinematic black #080808 gradient sa suptilnim atmospheric glow oko proizvoda.

TOP:
- BeeBike wordmark gore-levo (mali, "BEE" žuto italic + "BIKE" belo italic)
- MASIVAN naslov modela: "${o.modelLabel.toUpperCase()}" u BeeBike žutoj #F5C842, heavy bold italic condensed sans-serif, all caps, gore-centralno

CENTER (dominira 60% frame-a):
${o.modelLabel} u boji ${o.color} — IDENTIČAN referentnoj slici. Dramatično studio osvetljenje, sharp rim highlights, tamna senka ispod. Product je fokus.

BOTTOM:
- Tagline: "${o.tagline}" — belo italic, medium
- CTA button outlined white: "${o.cta}"
${price(o)}${customTextBlock(o)}

${brand(o.showLogo)}
STIL: Premium dark automotive editorial, high contrast, clean.`,
  },
  {
    id: "collage",
    label: "Kolaž detalja",
    emoji: "🖼",
    description: "3 close-up detalja gore + hero shot dole",
    buildPrompt: (o) => `Instagram Story 9:16 vertical, 1080x1920px. Kolaž detalja poster za BeeBike ${o.modelLabel}.

${CRITICAL}

BACKGROUND: Cinematic tamna crna #080808.

TOP 40% — TRI PANELA u tankim belim ramovima side by side, blago iskošeni:
- Levi panel: close-up prednjeg fara/kormila ${o.modelLabel}
- Sredina: close-up sedišta ili tank/gornji deo
- Desni panel: close-up zadnjeg dela/svetla
Sva 3 panela pokazuju ${o.modelLabel} u ${o.color} boji, IDENTIČAN referentnoj slici. Dramatično studio osvetljenje.

CENTER-BOTTOM (55% frame-a):
Full ${o.modelLabel} u ${o.color} — 3/4 front-left ugao, dominira. Fokus, oštra svetla.

BOTTOM:
- MASIVAN naslov "${o.modelLabel.toUpperCase()}" u BeeBike žutoj #F5C842, heavy bold italic condensed
- Tagline: "${o.tagline}" — belo, manje
- CTA: "${o.cta}"
${price(o)}${customTextBlock(o)}

${brand(o.showLogo)}
STIL: Ultra-premium dark automotive editorial, kolaž layout kao Vespa Sprint / Yamaha MT-15 posteri.`,
  },
  {
    id: "price",
    label: "Cena / Promo",
    emoji: "💰",
    description: "Fokus na cenu — velika cifra, mesečna rata, CTA",
    buildPrompt: (o) => `Instagram Story 9:16 vertical, 1080x1920px. Cena/promo poster za BeeBike ${o.modelLabel}.

${CRITICAL}

BACKGROUND: Deep black #080808 sa suptilnim žutim akcentima u ugolovima.

LEFT SIDE (50%):
${o.modelLabel} u boji ${o.color} — IDENTIČAN referentnoj, 3/4 ugao, dramatično osvetljen.

RIGHT SIDE (50%):
- Mali naslov gore: "${o.modelLabel.toUpperCase()}" u žutoj #F5C842
- OGROMNA cena centralno: "${o.price?.toLocaleString() || "XX.XXX"} RSD" u beloj, heavy bold, dominira
- Ispod: "ili" small belo italic
- Rata: "${o.priceMonthly?.toLocaleString() || "X.XXX"} RSD × 24 rata" u BeeBike žutoj #F5C842, bold
- Tagline dole: "${o.tagline}" — belo italic

BOTTOM:
- CTA button pun žut #F5C842 sa crnim tekstom: "${o.cta}"
${customTextBlock(o)}

${brand(o.showLogo)}
STIL: Direct-response ad, high contrast, cena je hero.`,
  },
  {
    id: "lifestyle",
    label: "Lifestyle / Urbano",
    emoji: "🌆",
    description: "Model u urbanoj sceni — grad noću, ulica, atmosfera",
    buildPrompt: (o) => `Instagram Story 9:16 vertical, 1080x1920px. Lifestyle poster za BeeBike ${o.modelLabel}.

${CRITICAL}

SCENA: Urban night scene — beogradska ulica noću, neonski/street light glow, blago wet asphalt refleksije, atmospheric mist. Ne previše detaljno — proizvod ostaje fokus.

CENTER:
${o.modelLabel} u boji ${o.color} — IDENTIČAN referentnoj, parkiran ili u lakom pokretu, 3/4 ugao. Dramatično warm-cool contrast osvetljenje: warm rim light na proizvodu, cool ambient okolo.

TOP:
- BeeBike wordmark levo (small)
- Mali spacing caps beli tekst: "BEEBIKE ${o.modelLabel.toUpperCase()}"

BOTTOM:
- MASIVAN "${o.modelLabel.toUpperCase()}" u žutoj #F5C842, heavy italic condensed
- Tagline: "${o.tagline}" — belo italic, medium
- CTA: "${o.cta}"
${price(o)}${customTextBlock(o)}

${brand(o.showLogo)}
STIL: Cinematic urban editorial, filmski look, atmospheric ali proizvod dominira.`,
  },
  {
    id: "comparison",
    label: "Poređenje 2-3 modela",
    emoji: "⚖",
    description: "Više modela jedan pored drugog — pomaže kupcu da bira",
    isMultiModel: true,
    buildPrompt: (o) => {
      const allModels = [
        { label: o.modelLabel, color: o.color, tagline: o.tagline, price: o.price },
        ...(o.additionalModels || []),
      ];
      const cols = allModels.length;
      return `Instagram Story 9:16 vertical, 1080x1920px. Comparison poster BeeBike modela.

${CRITICAL}

BACKGROUND: Deep black #080808.

TOP:
- BeeBike wordmark levo
- Naslov centralno: "IZABERI SVOJ" u žutoj #F5C842, bold caps

MIDDLE (60%) — ${cols} vertikalna panela side by side, razdvojena tankim belim linijama:
${allModels
  .map(
    (m, i) => `Panel ${i + 1}:
- ${m.label} u boji ${m.color}, IDENTIČAN referentnoj, portrait ugao
- Ispod: naziv "${m.label.toUpperCase()}" u žutoj #F5C842, bold
- Cena: "${m.price?.toLocaleString() || "XX.XXX"} RSD" belo bold
- Tagline mali: "${m.tagline}" belo italic`
  )
  .join("\n")}

BOTTOM:
- CTA: "PORUČI DANAS"
${customTextBlock(o)}

${brand(o.showLogo)}
STIL: Editorial comparison layout, čist, direct.`;
    },
  },
  {
    id: "minimal",
    label: "Minimal / Studio",
    emoji: "◻",
    description: "Čist studio setup — bez pozadinske drame, samo proizvod",
    buildPrompt: (o) => `Instagram Story 9:16 vertical, 1080x1920px. Minimalistic studio poster za BeeBike ${o.modelLabel}.

${CRITICAL}

BACKGROUND: Solid deep black #080808, potpuno čist, bez gradijenta, bez teksture.

CENTER (proizvod ZAUZIMA 65% frame-a):
${o.modelLabel} u boji ${o.color} — IDENTIČAN referentnoj slici. Kristalno čisto studio osvetljenje bez drame, mekana senka ispod. Portrait fokus na proizvod.

TOP:
- Mali BeeBike wordmark levo
- Model naziv desno: "${o.modelLabel}" u žutoj #F5C842, small caps, spaced letters

BOTTOM:
- MASIVAN "${o.modelLabel.toUpperCase()}" u žutoj #F5C842, heavy italic condensed, spanning full width
- Ispod thin line: tagline "${o.tagline}" — belo italic, small
- CTA na dnu: "${o.cta}" u malom outlined belom button-u
${price(o)}${customTextBlock(o)}

${brand(o.showLogo)}
STIL: Apple-style minimalistic product studio. Zero visual noise. Proizvod diše.`,
  },
];

export function getTemplate(id: string) {
  return TEMPLATES.find(t => t.id === id);
}
