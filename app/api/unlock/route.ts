import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const expected = process.env.DEMO_PASSWORD ?? "wr80";
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const provided = (body.password ?? "").trim();
  const ok = provided === expected;
  return Response.json({ ok });
}
