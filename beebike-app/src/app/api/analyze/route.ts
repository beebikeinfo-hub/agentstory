import { NextRequest, NextResponse } from "next/server";

const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType, modelLabel, color, tagline, cta, showPrice, price, priceMonthly, customText } = await req.json();

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
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageBase64 }
            },
            {
              type: "text",
              text: `Ti si BeeBike vizuelni direktor. Analiziraj ovu referentnu sliku i napiši Higgsfield image generation prompt za Instagram Story (9:16, 1080x1920px).

PROIZVOD: ${modelLabel} u boji ${color}
TAGLINE: "${tagline}"
CTA: "${cta}"
${showPrice && price ? `CENA: ${price.toLocaleString()} RSD / ${priceMonthly?.toLocaleString()} RSD mesečno` : "BEZ CENE"}
${customText ? `DODATNI TEKST: ${customText}` : ""}

BEEBIKE BRAND PRAVILA:
- Žuta #F5C842 SAMO za naslov modela i akcente
- Pozadina: crna #080808 — UVEK tamna, nikad svetla
- Bela za ostali tekst i CTA
- BeeBike wordmark gore-levo: "BEE" žuto + "BIKE" belo, italic bold, mali

NAJVAŽNIJE PRAVILO: Slika proizvoda mora biti IDENTIČNA referentnoj Higgsfield slici koja se dodaje kao media reference. Ne menjati dizajn, oblik, proporcije ni boju proizvoda ni za dlaku.

Analiziraj referencu:
- Kako je podeljen frame (zones, proporcije)
- Mood i atmosfera
- Pozicija i stil tipografije
- Tip i ugao fotografije proizvoda

Adaptiraj tu strukturu za BeeBike ${modelLabel} story.

Odgovori SAMO promptom, bez ikakvog uvoda, objašnjenja ili markdown. Samo čist prompt tekst, 250-400 reči, na engleskom.`
            }
          ]
        }]
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const prompt = data.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("");
    return NextResponse.json({ prompt });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
