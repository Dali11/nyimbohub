import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { neon } from "@neondatabase/serverless";

const artworkDir = path.join(process.env.HOME || "", "Downloads", "artwork");
const accountId = process.env.R2_ACCOUNT_ID || process.env.ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET || "nyimbohub-media";
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing; no secrets were printed.");
const sql = neon(process.env.DATABASE_URL);
if (!accountId || !accessKeyId || !secretAccessKey) throw new Error("Cloudflare R2 credentials are missing; no secrets were printed.");
const r2 = new S3Client({ region: "auto", endpoint: process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`, forcePathStyle: true, credentials: { accessKeyId, secretAccessKey } });

const assets = [
  { source: "WhatsApp Image 2026-10-09 at 6.59.02 AM.jpeg", key: "covers/uja-ukufuna-iwe.webp", title: "Uja Ukufuna-iwe" },
  { source: "WhatsApp Image 2026-10-09 at 6.59.03 AM(1).jpeg", key: "covers/malo.webp", title: null },
  { source: "WhatsApp Image 2026-10-09 at 6.59.03 AM.jpeg", key: "covers/una-sweka.webp", title: null },
  { source: "WhatsApp Image 2026-10-09 at 2.52.55 PM(1).jpeg", key: "covers/gender-based-violence.webp", title: null },
  { source: "WhatsApp Image 2026-10-09 at 2.52.55 PM.jpeg", key: "covers/about-us.webp", title: "About Us" },
  { source: "WhatsApp Image 2026-10-09 at 2.52.54 PM.jpeg", key: "covers/anti-goda.webp", title: "Antigoda" },
];

async function main() {
  let totalBytes = 0;
  for (const asset of assets) {
    const input = await fs.readFile(path.join(artworkDir, asset.source));
    const output = await sharp(input).rotate().resize(700, 700, { fit: "cover", position: "centre", withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toBuffer();
    await r2.send(new PutObjectCommand({ Bucket: bucket, Key: asset.key, Body: output, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }));
    totalBytes += output.length;
    let linked = 0;
    if (asset.title) {
      const rows = await sql`UPDATE tracks SET cover_key = ${asset.key} WHERE lower(title) = lower(${asset.title}) RETURNING title`;
      for (const row of rows) {
        console.log(`LINKED ${row.title} -> ${asset.key}`);
        linked++;
      }
      if (!linked) console.log(`UPLOADED, no track title match: ${asset.title} -> ${asset.key}`);
    } else console.log(`UPLOADED, awaiting matching track: ${asset.key}`);
    console.log(`${asset.key}: ${input.length} -> ${output.length} bytes`);
  }
  console.log(`ARTWORK_IMPORT_COMPLETE: ${assets.length} covers uploaded; total optimized size ${totalBytes} bytes.`);
}
main().catch((error) => { console.error("Artwork upload failed:", error instanceof Error ? error.message : "unknown error"); process.exitCode = 1; }).finally(() => r2.destroy());
