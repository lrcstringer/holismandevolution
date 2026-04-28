import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import type { Manifest } from "@/types/resources";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET = process.env.R2_BUCKET_NAME ?? "resources";
export const PUBLIC_URL =
  process.env.R2_PUBLIC_URL ?? "https://resources.holismandevolution.com";

const MANIFEST_KEY = "_manifest.json";

export async function getManifest(): Promise<Manifest> {
  try {
    const res = await r2.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: MANIFEST_KEY })
    );
    const text = await res.Body?.transformToString("utf-8");
    return text ? JSON.parse(text) : { sections: [] };
  } catch {
    return { sections: [] };
  }
}

export async function saveManifest(manifest: Manifest): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: MANIFEST_KEY,
      Body: JSON.stringify(manifest, null, 2),
      ContentType: "application/json",
    })
  );
}

export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
}
