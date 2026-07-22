import { NextRequest, NextResponse } from "next/server";

const HF_API = "https://api.higgsfield.ai";
const HF_KEY = process.env.HIGGSFIELD_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { prompt, mediaIds, quality = "low", count = 1 } = await req.json();

    if (!prompt || !mediaIds || mediaIds.length === 0) {
      return NextResponse.json({ error: "Nedostaje prompt ili mediaIds" }, { status: 400 });
    }

    const body = {
      model: "nano_banana_2",
      aspect_ratio: "9:16",
      resolution: quality === "high" ? "2k" : "1k",
      prompt,
      count: Math.min(count, 4),
      medias: mediaIds.map((id: string) => ({ value: id, role: "image" })),
    };

    const res = await fetch(`${HF_API}/v1/image/generation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json({ error: await res.text() }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
