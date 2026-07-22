import { NextRequest, NextResponse } from "next/server";

const HF_API = "https://api.higgsfield.ai";
const HF_KEY = process.env.HIGGSFIELD_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { prompt, mediaId } = await req.json();

    if (!prompt || !mediaId) {
      return NextResponse.json({ error: "Nedostaje prompt ili mediaId" }, { status: 400 });
    }

    const body: Record<string, unknown> = {
      model: "nano_banana_2",
      aspect_ratio: "9:16",
      resolution: "1k",
      prompt,
      medias: [{ value: mediaId, role: "image" }],
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
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
