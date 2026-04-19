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
  const forceNoAcl = process.env.S3_UPLOAD_PUBLIC_ACL === "false";
  const baseInput = {
    Bucket: env.s3Bucket,
    Key: params.key,
    Body: params.body,
    ContentType: params.contentType,
    CacheControl: "public, max-age=31536000, immutable",
  } as const;

  if (!forceNoAcl) {
    try {
      await c.send(new PutObjectCommand({ ...baseInput, ACL: "public-read" }));
    } catch (err: unknown) {
      const name = err && typeof err === "object" && "name" in err ? String((err as { name: string }).name) : "";
      if (name === "AccessControlListNotSupported" || name === "InvalidRequest") {
        await c.send(new PutObjectCommand(baseInput));
        console.warn(
          "[S3] Bucket does not allow object ACLs. Objects are uploaded private; add a bucket policy so s3:GetObject is public for your prefix (e.g. products/*), or use S3_UPLOAD_PUBLIC_ACL=false if you already use a policy-only setup."
        );
      } else {
        throw err;
      }
    }
  } else {
    await c.send(new PutObjectCommand(baseInput));
  }
  const base = env.s3PublicBaseUrl || "";
  if (!base) throw new Error("S3_PUBLIC_BASE_URL is required for public image URLs.");
  return `${base}/${params.key}`;
}
