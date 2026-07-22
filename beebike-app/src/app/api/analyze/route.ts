import { NextRequest, NextResponse } from "next/server";

const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const {
      imageBase64, mediaType, modelLabel, color,
      tagline, cta, showPrice, showLogo, price, priceMonthly, customText
    } = await req.json();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: `Ti si BeeBike vizuelni direktor. Analiziraj referentnu sliku i napiši Higgsfield image generation prompt za Instagram Story (9:16, 1080x1920px).

PROIZVOD: ${modelLabel} u boji ${color}
TAGLINE: "${tagline}"
CTA: "${cta}"
${showPrice && price ? `CENA: ${price.toLocaleString()} RSD / ${priceMonthly?.toLocaleString()} RSD mesečno` : "BEZ CENE"}
${customText ? `DODATNI TEKST: ${customText}` : ""}

BEEBIKE BRAND:
- Žuta #F5C842 SAMO za naziv modela i akcente
- Crna pozadina #080808 — UVEK tamna
- Bela za tekst i CTA
${showLogo ? '- BeeBike wordmark gore-levo: "BEE" žuto + "BIKE" belo, italic bold, mali' : '- BEZ LOGA'}

KRITIČNO: Slika proizvoda mora biti IDENTIČNA referentnoj Higgsfield slici. Ne menjati dizajn, oblik, proporcije ni boju.

Analiziraj referencu, adaptiraj strukturu za BeeBike ${modelLabel}.

Odgovori SAMO promptom, bez uvoda ili markdown. Čist prompt tekst, 250-400 reči, engleski.` }
          ]
        }]
      })
    });

    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });

    const data = await res.json();
    const prompt = data.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("");
    return NextResponse.json({ prompt });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
