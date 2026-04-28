import { NextResponse } from "next/server";
import { getManifest, saveManifest } from "@/lib/r2";
import type { Manifest } from "@/types/resources";

export const runtime = "edge";

function authed(req: Request): boolean {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getManifest());
}

export async function PUT(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const manifest: Manifest = await req.json();
  await saveManifest(manifest);
  return NextResponse.json({ ok: true });
}
