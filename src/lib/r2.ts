import { AwsClient } from "aws4fetch";
import type { Manifest } from "@/types/resources";

export const BUCKET = process.env.R2_BUCKET_NAME ?? "resources";
export const PUBLIC_URL =
  process.env.R2_PUBLIC_URL ?? "https://resources.holismandevolution.com";

const MANIFEST_KEY = "_manifest.json";

function client() {
  return new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    service: "s3",
  });
}

function endpoint(key: string) {
  return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}/${key}`;
}

export async function getManifest(): Promise<Manifest> {
  try {
    const res = await client().fetch(endpoint(MANIFEST_KEY));
    if (!res.ok) return { sections: [] };
    return res.json();
  } catch {
    return { sections: [] };
  }
}

export async function saveManifest(manifest: Manifest): Promise<void> {
  await client().fetch(endpoint(MANIFEST_KEY), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(manifest, null, 2),
  });
}

export async function uploadToR2(
  key: string,
  body: ArrayBuffer,
  contentType: string
): Promise<void> {
  await client().fetch(endpoint(key), {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body,
  });
}
