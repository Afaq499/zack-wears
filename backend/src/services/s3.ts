import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

let client: S3Client | null = null;

function getClient() {
  if (!env.awsAccessKeyId || !env.awsSecretAccessKey || !env.s3Bucket) return null;
  if (!client) {
    client = new S3Client({
      region: env.awsRegion,
      credentials: {
        accessKeyId: env.awsAccessKeyId,
        secretAccessKey: env.awsSecretAccessKey,
      },
    });
  }
  return client;
}

export function s3Configured() {
  return Boolean(getClient() && env.s3PublicBaseUrl);
}

export async function uploadBuffer(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  const c = getClient();
  if (!c || !env.s3Bucket) {
    throw new Error("S3 is not configured. Set AWS keys and S3_BUCKET.");
  }
  await c.send(
    new PutObjectCommand({
      Bucket: env.s3Bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  const base = env.s3PublicBaseUrl || "";
  if (!base) throw new Error("S3_PUBLIC_BASE_URL is required for public image URLs.");
  return `${base}/${params.key}`;
}
