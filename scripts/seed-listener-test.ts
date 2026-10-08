import { config } from "dotenv";
config({ path: ".env.local" });

import { readFile } from "node:fs/promises";
import path from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { and, eq } from "drizzle-orm";

import { db } from "../src/db";
import { artists, tracks } from "../src/db/schema";

const bucket = process.env.S3_BUCKET;

if (!bucket) {
  throw new Error("S3_BUCKET is not configured");
}

const s3 = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const testAudioDir = path.join(process.cwd(), "test-audio");

const testTracks = [
  {
    filename: "Phyzix - Makofi ft Dare Devilz (Prod. Dare Devilz & Stich Fray).mp3",
    key: "audio/test/phyzix-makofi.mp3",
    title: "Makofi ft Dare Devilz",
    gradient: "from-fuchsia-500 to-violet-900",
  },
  {
    filename: "Phyzix - Tandiuze ft Teddy Makadi.mp3",
    key: "audio/test/phyzix-tandiuze.mp3",
    title: "Tandiuze ft Teddy Makadi",
    gradient: "from-pink-500 to-rose-900",
  },
];

async function main() {
  console.log("Uploading listener test tracks...\n");

  let [artist] = await db
    .select()
    .from(artists)
    .where(eq(artists.slug, "phyzix"))
    .limit(1);

  if (!artist) {
    [artist] = await db
      .insert(artists)
      .values({
        slug: "phyzix",
        name: "Phyzix",
        location: "Malawi",
        verified: false,
        followers: 0,
        bio: "Listener playback test catalog record.",
        gradient: "from-fuchsia-500 to-violet-900",
      })
      .returning();
  }

  console.log(`Catalog artist: ${artist.name} (${artist.id})`);

  for (const item of testTracks) {
    const filePath = path.join(testAudioDir, item.filename);
    const body = await readFile(filePath);

    console.log(`Uploading: ${item.filename}`);

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: item.key,
        Body: body,
        ContentType: "audio/mpeg",
      }),
    );

    const [existing] = await db
      .select()
      .from(tracks)
      .where(
        and(
          eq(tracks.artistId, artist.id),
          eq(tracks.title, item.title),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(tracks)
        .set({
          audioKey: item.key,
          genre: "Hip Hop",
          gradient: item.gradient,
        })
        .where(eq(tracks.id, existing.id));

      console.log(`Updated track: ${item.title}`);
    } else {
      const [created] = await db
        .insert(tracks)
        .values({
          artistId: artist.id,
          title: item.title,
          genre: "Hip Hop",
          durationSec: 0,
          plays: 0,
          gradient: item.gradient,
          audioKey: item.key,
        })
        .returning();

      console.log(`Created track: ${created.title} (${created.id})`);
    }

    console.log(`R2 key: ${item.key}\n`);
  }

  console.log("Listener test content is ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
