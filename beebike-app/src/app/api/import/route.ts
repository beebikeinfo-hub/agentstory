import { NextRequest, NextResponse } from "next/server";

const HF_API = "https://api.higgsfield.ai";
const HF_KEY = process.env.HIGGSFIELD_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    const res = await fetch(`${HF_API}/v1/asset/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_KEY}`,
      },
      body: JSON.stringify({ url, type: "image" }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: await res.text() }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
