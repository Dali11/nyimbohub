import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 is the primary store for the real music library. The old
// Neon S3-compatible store remains available for legacy keys already in the DB.
const cloudflareBucket = process.env.R2_BUCKET || "nyimbohub-media";
const cloudflareAccountId = process.env.R2_ACCOUNT_ID || process.env.ACCOUNT_ID;
const cloudflareAccessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.ACCESS_KEY_ID;
const cloudflareSecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.SECRET_ACCESS_KEY;

if (!cloudflareAccountId || !cloudflareAccessKeyId || !cloudflareSecretAccessKey) {
  throw new Error("Cloudflare R2 requires an account ID and R2 access key pair");
}

const cloudflareR2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || `https://${cloudflareAccountId}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: cloudflareAccessKeyId,
    secretAccessKey: cloudflareSecretAccessKey,
  },
});

// Existing catalogue rows with audioKey values like audio/test/... still live
// in Neon Object Storage. New Cloudflare objects use test/... or music/... keys.
const legacyBucket = process.env.S3_BUCKET;
const legacyR2 = legacyBucket && process.env.AWS_ENDPOINT_URL_S3 && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  ? new S3Client({
      region: process.env.AWS_REGION || "auto",
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

function clientForKey(key: string) {
  if (key.startsWith("audio/") && legacyR2 && legacyBucket) {
    return { client: legacyR2, bucket: legacyBucket };
  }
  return { client: cloudflareR2, bucket: cloudflareBucket };
}

export async function uploadToR2({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Uint8Array | Buffer | ReadableStream;
  contentType: string;
}) {
  await cloudflareR2.send(
    new PutObjectCommand({
      Bucket: cloudflareBucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return key;
}

export async function getR2DownloadUrl(
  key: string,
  expiresIn = 3600,
) {
  const { client, bucket } = clientForKey(key);
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn },
  );
}

export async function deleteFromR2(key: string) {
  const { client, bucket } = clientForKey(key);
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function getR2Object(key: string) {
  const { client, bucket } = clientForKey(key);
  return client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
}

// Kept for compatibility with any older imports; this is the Cloudflare client.
export const r2 = cloudflareR2;
