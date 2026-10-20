import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq } from "drizzle-orm";
import { HeadObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { artists, tracks } from "../src/db/schema";

const accountId = process.env.R2_ACCOUNT_ID || process.env.ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET || "nyimbohub-media";
if (!accountId || !accessKeyId || !secretAccessKey || !process.env.DATABASE_URL) {
  throw new Error("Missing Cloudflare R2 or database configuration; no values are printed.");
}
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
});
const db = drizzle(neon(process.env.DATABASE_URL));

// Filename-derived suggestions only; imported artists remain unverified for review.
const metadata: Record<string, { title: string; artist: string; genre: string }> = {
  "About_Us_The_Xerox_(Pepsin_Mw_X_Emkaytee_X_Murray_Banda).mp3": { title: "About Us", artist: "Xerox, Pepsin Mw, Emkaytee & Murray Banda", genre: "Malawian Music" },
  "Cee emm x Samzynt Ft Madala Mafo_Nambe_(Prod Cee emm).mp3": { title: "Nambe", artist: "Cee emm, Samzynt & Madala Mafo", genre: "Malawian Music" },
  "Cee-emm_Ft_Akatune-Uja_Ukufuna-iwe-Prod-by-Cee-emm.mp3": { title: "Uja Ukufuna-iwe", artist: "Cee-emm & Akatune", genre: "Malawian Music" },
  "PEPSIN    GIN.mp3": { title: "Gin", artist: "Pepsin", genre: "Malawian Music" },
  "PEPSIN    SOKOSERA.mp3": { title: "Sokosera", artist: "Pepsin", genre: "Malawian Music" },
  "PEPSIN   PENA.mp3": { title: "Pena", artist: "Pepsin", genre: "Malawian Music" },
  "PEPSIN  N  CYLO F28    MOTO.mp3": { title: "Moto", artist: "Pepsin, N-Cylo & F28", genre: "Malawian Music" },
  "PEPSIN N  ISHU KAY      ALAMWANU.mp3": { title: "Alamwanu", artist: "Pepsin, N-Ishu & Kay", genre: "Malawian Music" },
  "Pepsin_Why.mp3": { title: "Why", artist: "Pepsin", genre: "Malawian Music" },
  "Pepsin_x_F28Cyclo_Aweh_(Prod_Cee_emm).mp3": { title: "Aweh", artist: "Pepsin & F28 Cyclo", genre: "Malawian Music" },
  "XEROX.mp3": { title: "Xerox", artist: "Xerox", genre: "Malawian Music" },
  "Xerox_(Cyclo c, Pepsin, Emkat33_ Si Azanthu- Prod by Osphyn & Cee M (1).mp3": { title: "Si Azanthu", artist: "Xerox, Cyclo C, Pepsin & Emkat33", genre: "Malawian Music" },
  "antigoda.mp3": { title: "Antigoda", artist: "Unknown Artist", genre: "Malawian Music" },
};
function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90) || "unknown-artist";
}
function estimateMp3Duration(bytes: number, bitrate = 128_000) {
  return Math.max(1, Math.round((bytes * 8) / bitrate));
}

async function main() {
  const listing = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: "test/" }));
  const objects = (listing.Contents ?? []).filter((o) => o.Key && o.Key.toLowerCase().endsWith(".mp3") && o.Size && o.Size > 0);
  if (!objects.length) throw new Error(`No MP3 objects found under test/ in ${bucket}.`);
  let inserted = 0, skipped = 0;
  const artistIds = new Map<string, string>();
  for (const object of objects) {
    const key = object.Key!;
    const filename = key.split("/").pop()!;
    const suggested = metadata[filename];
    if (!suggested) {
      console.log(`SKIP no filename mapping: ${filename}`);
      skipped++;
      continue;
    }
    let artistId = artistIds.get(suggested.artist);
    if (!artistId) {
      const slugBase = slugify(suggested.artist);
      const existingArtist = await db.select({ id: artists.id }).from(artists).where(eq(artists.slug, slugBase)).limit(1);
      if (existingArtist[0]) artistId = existingArtist[0].id;
      else {
        const [created] = await db.insert(artists).values({
          slug: slugBase,
          name: suggested.artist,
          location: "Malawi",
          verified: false,
          bio: "Artist details imported from the NyimboHub music library. Name and credits are filename-derived and awaiting review.",
        }).returning({ id: artists.id });
        artistId = created.id;
      }
      artistIds.set(suggested.artist, artistId);
    }
    const duplicate = await db.select({ id: tracks.id }).from(tracks).where(and(eq(tracks.artistId, artistId), eq(tracks.title, suggested.title))).limit(1);
    if (duplicate[0]) {
      console.log(`SKIP already exists: ${suggested.title} — ${suggested.artist}`);
      skipped++;
      continue;
    }
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    const size = head.ContentLength ?? object.Size ?? 0;
    // MP3 frame-rate metadata is not supplied by R2; use a conservative 128 kbps estimate.
    const durationSec = estimateMp3Duration(size);
    await db.insert(tracks).values({
      artistId,
      title: suggested.title,
      genre: suggested.genre,
      durationSec,
      plays: 0,
      audioKey: key,
    });
    console.log(`IMPORTED ${suggested.title} — ${suggested.artist} | ${durationSec}s | ${key}`);
    inserted++;
  }
  console.log(`\nImport complete: ${inserted} inserted, ${skipped} skipped, ${objects.length} MP3 files found.`);
  console.log("Artist credits and durations are filename-derived estimates; review them in admin before treating them as verified metadata.");
}
main().catch((error) => { console.error("Import failed:", error instanceof Error ? error.message : "unknown error"); process.exitCode = 1; }).finally(() => s3.destroy());
