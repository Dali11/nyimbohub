import type { Metadata } from "next";
import { getTrending } from "@/db/queries";
import TrackRow from "@/components/music/TrackRow";
import MusicLayout from "./../music/layout";

export const metadata: Metadata = { title: "Trending — NyimboHub" };

export default async function TrendingPage() {
  const rows = await getTrending();

  const tracks = rows.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    genre: t.genre,
    durationSec: t.durationSec,
    plays: t.plays,
    gradient: t.gradient,
    coverUrl: t.coverKey ? `/api/media/cover/${t.id}` : undefined,
    audioUrl: t.audioKey ? `/api/media/audio/${t.id}` : undefined,
  })) as import("@/lib/types").Track[];

  return (
    <MusicLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <h1 className="mb-6 text-3xl font-bold">Trending</h1>
        <p className="mb-6 text-sm text-muted">
          Tracks the community has played most often — right now.
        </p>
        <div className="space-y-1">
          {tracks.map((track, index) => (
            <TrackRow key={track.id} track={track} index={index} queue={tracks} />
          ))}
        </div>
      </div>
    </MusicLayout>
  );
}
