import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import {
  getArtistBySlug,
  getTracksByArtist,
  getVideosByArtist,
} from "@/db/queries";
import type { Artist, Track, Video } from "@/lib/types";
import { formatAgo, formatPlays, formatTime } from "@/lib/format";
import ArtistActions from "@/components/artists/ArtistActions";
import ArtistTabs from "@/components/artists/ArtistTabs";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  return { title: artist ? `${artist.name} — NyimboHub` : "Artist not found" };
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const songs = (await getTracksByArtist(artist.id)).map((t) => ({
    id: t.id,
    title: t.title,
    artist: artist.name,
    artistSlug: artist.slug,
    genre: t.genre,
    durationSec: t.durationSec,
    plays: t.plays,
    gradient: t.gradient,
    audioUrl: t.audioKey ? `/api/media/audio/${t.id}` : undefined,
  })) as Track[];

  const vids = (await getVideosByArtist(artist.id)).map((v) => ({
    id: v.id,
    title: v.title,
    artist: artist.name,
    views: v.views,
    ago: formatAgo(v.createdAt),
    duration: formatTime(v.durationSec),
    gradient: v.gradient,
    tags: v.tags,
  })) as Video[];

  const totalPlays = songs.reduce((sum, t) => sum + t.plays, 0);
  const initials = artist.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  const artistObj: Artist = {
    slug: artist.slug,
    name: artist.name,
    location: artist.location,
    verified: artist.verified,
    followers: artist.followers,
    bio: artist.bio,
    gradient: artist.gradient,
  };

  const stats = [
    { label: "Songs", value: String(songs.length) },
    { label: "Plays", value: formatPlays(totalPlays) },
    { label: "Followers", value: formatPlays(artist.followers) },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="relative h-56 overflow-hidden sm:h-72 sm:rounded-b-3xl">
        <div className={`absolute inset-0 bg-gradient-to-br ${artist.gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
      </div>

      <div className="px-4 sm:px-6">
        <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <div
            className={`relative grid size-28 shrink-0 place-items-center rounded-full border-4 border-bg bg-gradient-to-br ${artist.gradient} text-3xl font-bold sm:size-32`}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              {artist.name}
              {artist.verified && <BadgeCheck className="size-6 text-brand" />}
            </h1>
            <p className="text-sm text-muted">Artist • {artist.location}</p>
          </div>

          <ArtistActions name={artist.name} />
        </div>

        <div className="mt-6 flex gap-8">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <ArtistTabs artist={artistObj} songs={songs} videos={vids} />
        </div>
      </div>
    </div>
  );
}
