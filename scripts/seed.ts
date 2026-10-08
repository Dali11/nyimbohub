import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { count } from "drizzle-orm";
import { artists, tracks, videos } from "../src/db/schema";
import {
  artists as mockArtists,
  tracks as mockTracks,
  videos as mockVideos,
} from "../src/lib/mock-data";

function durationToSec(d: string): number {
  const [m, s] = d.split(":").map(Number);
  return m * 60 + (s || 0);
}

function agoToDate(ago: string): Date {
  const match = ago.match(/(\d+)\s+(day|week|month)/);
  const n = match ? Number(match[1]) : 0;
  const unit = match?.[2] ?? "day";
  const days = unit === "month" ? n * 30 : unit === "week" ? n * 7 : n;
  return new Date(Date.now() - days * 86_400_000);
}

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  // dev seed: wipes and reloads. Don't run once real data exists.
  await db.delete(tracks);
  await db.delete(videos);
  await db.delete(artists);

  const insertedArtists = await db
    .insert(artists)
    .values(
      mockArtists.map((a) => ({
        slug: a.slug,
        name: a.name,
        location: a.location,
        verified: a.verified,
        followers: a.followers,
        bio: a.bio,
        gradient: a.gradient,
      })),
    )
    .returning({ id: artists.id, name: artists.name });

  const idByName = new Map(insertedArtists.map((a) => [a.name, a.id]));
  const artistId = (name: string) => {
    const id = idByName.get(name);
    if (!id) throw new Error(`No artist found for "${name}"`);
    return id;
  };

  await db.insert(tracks).values(
    mockTracks.map((t) => ({
      artistId: artistId(t.artist),
      title: t.title,
      genre: t.genre,
      durationSec: t.durationSec,
      plays: t.plays,
      gradient: t.gradient,
    })),
  );

  await db.insert(videos).values(
    mockVideos.map((v) => ({
      artistId: artistId(v.artist),
      title: v.title,
      views: v.views,
      durationSec: durationToSec(v.duration),
      gradient: v.gradient,
      tags: v.tags,
      createdAt: agoToDate(v.ago),
    })),
  );

  const [a] = await db.select({ n: count() }).from(artists);
  const [t] = await db.select({ n: count() }).from(tracks);
  const [v] = await db.select({ n: count() }).from(videos);
  console.log(`seeded: ${a.n} artists, ${t.n} tracks, ${v.n} videos`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
