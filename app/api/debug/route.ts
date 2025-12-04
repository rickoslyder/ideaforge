import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Simple debug endpoint to test POST works on Vercel
export async function GET(req: NextRequest) {
  return Response.json({
    method: "GET",
    url: req.url,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  let body = null;
  try {
    body = await req.json();
  } catch {
    body = "failed to parse";
  }

  return Response.json({
    method: "POST",
    url: req.url,
    body,
    headers: Object.fromEntries(req.headers.entries()),
    timestamp: new Date().toISOString(),
  });
}
