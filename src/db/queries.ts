import { cacheLife, cacheTag } from "next/cache";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { artists, tracks, videos } from "./schema";

export async function getMusicTracks() {
  "use cache";
  cacheTag("music:tracks");
  cacheLife("minutes");

  return db
    .select({
      id: tracks.id,
      title: tracks.title,
      artist: artists.name,
      artistSlug: artists.slug,
      genre: tracks.genre,
      durationSec: tracks.durationSec,
      plays: tracks.plays,
      gradient: tracks.gradient,
      audioKey: tracks.audioKey,
      coverKey: tracks.coverKey,
      createdAt: tracks.createdAt,
    })
    .from(tracks)
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .orderBy(desc(tracks.plays));
}

// --- Specialized listing queries (cache tagged like the others) ---

export async function getNewReleases() {
  "use cache";
  cacheTag("music:tracks");
  cacheLife("minutes");

  return db
    .select({
      id: tracks.id,
      title: tracks.title,
      artist: artists.name,
      artistSlug: artists.slug,
      genre: tracks.genre,
      durationSec: tracks.durationSec,
      plays: tracks.plays,
      gradient: tracks.gradient,
      audioKey: tracks.audioKey,
      coverKey: tracks.coverKey,
      createdAt: tracks.createdAt,
    })
    .from(tracks)
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .orderBy(desc(tracks.createdAt));
}

export async function getTrending() {
  "use cache";
  cacheTag("music:tracks");
  cacheLife("minutes");

  return db
    .select({
      id: tracks.id,
      title: tracks.title,
      artist: artists.name,
      genre: tracks.genre,
      durationSec: tracks.durationSec,
      plays: tracks.plays,
      gradient: tracks.gradient,
      audioKey: tracks.audioKey,
      coverKey: tracks.coverKey,
    })
    .from(tracks)
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .orderBy(desc(tracks.createdAt));
}

export async function getCharts() {
  "use cache";
  cacheTag("music:tracks");
  cacheLife("minutes");

  return db
    .select({
      id: tracks.id,
      title: tracks.title,
      artist: artists.name,
      genre: tracks.genre,
      durationSec: tracks.durationSec,
      plays: tracks.plays,
      gradient: tracks.gradient,
      audioKey: tracks.audioKey,
      coverKey: tracks.coverKey,
    })
    .from(tracks)
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .orderBy(desc(tracks.plays))
    .limit(20);
}

export async function getGenres() {
  "use cache";
  cacheTag("music:tracks");
  cacheLife("minutes");

  const rows = await db
    .select({
      genre: tracks.genre,
      count: sql`(select count(*)::int from tracks t2 where t2.genre = tracks.genre)`,
    })
    .from(tracks)
    .groupBy(tracks.genre)
    .orderBy(desc(tracks.genre));

  return rows as { genre: string; count: number }[];
}

export async function getTracksByGenre(genre: string) {
  "use cache";
  cacheTag("music:tracks");
  cacheLife("minutes");

  return db
    .select({
      id: tracks.id,
      title: tracks.title,
      artist: artists.name,
      genre: tracks.genre,
      durationSec: tracks.durationSec,
      plays: tracks.plays,
      gradient: tracks.gradient,
      audioKey: tracks.audioKey,
      coverKey: tracks.coverKey,
    })
    .from(tracks)
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .where(eq(tracks.genre, genre))
    .orderBy(desc(tracks.plays));
}

export async function getArtists() {
  "use cache";

  return db
    .select()
    .from(artists)
    .orderBy(desc(artists.followers));
}

export async function getArtistBySlug(slug: string) {
  "use cache";

  const [artist] = await db
    .select()
    .from(artists)
    .where(eq(artists.slug, slug))
    .limit(1);

  return artist ?? null;
}

export async function getTracksByArtist(artistId: string) {
  "use cache";

  return db
    .select()
    .from(tracks)
    .where(eq(tracks.artistId, artistId))
    .orderBy(desc(tracks.plays));
}

export async function getVideos() {
  "use cache";

  return db
    .select({
      id: videos.id,
      title: videos.title,
      artist: artists.name,
      views: videos.views,
      durationSec: videos.durationSec,
      gradient: videos.gradient,
      tags: videos.tags,
      videoKey: videos.videoKey,
      thumbnailKey: videos.thumbnailKey,
      createdAt: videos.createdAt,
    })
    .from(videos)
    .innerJoin(artists, eq(videos.artistId, artists.id))
    .orderBy(desc(videos.createdAt));
}

export async function getVideosByArtist(artistId: string) {
  "use cache";

  return db
    .select()
    .from(videos)
    .where(eq(videos.artistId, artistId))
    .orderBy(desc(videos.createdAt));
}
