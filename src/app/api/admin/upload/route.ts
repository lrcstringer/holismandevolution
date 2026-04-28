import { NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

export const runtime = "edge";

function authed(req: Request): boolean {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function POST(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `files/${Date.now()}-${safeName}`;
  const buffer = await file.arrayBuffer();

  await uploadToR2(key, buffer, file.type || "application/octet-stream");

  return NextResponse.json({ key, name: file.name });
}
