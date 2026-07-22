import { NextRequest, NextResponse } from "next/server";

const HF_API = "https://api.higgsfield.ai";
const HF_KEY = process.env.HIGGSFIELD_API_KEY!;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const res = await fetch(`${HF_API}/v1/image/generation/${jobId}`, {
    headers: { Authorization: `Bearer ${HF_KEY}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
