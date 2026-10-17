import type { Metadata } from "next";
import { getTrending } from "@/db/queries";
import { Music2 } from "lucide-react";
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
        {tracks.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2">
              <Music2 className="h-6 w-6 text-muted" />
            </div>
            <h3 className="text-lg font-semibold">No trending music yet</h3>
            <p className="mt-2 text-sm text-muted">We&apos;re discovering new tracks — come back soon.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {tracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} queue={tracks} />
            ))}
          </div>
        )}
      </div>
    </MusicLayout>
  );
}
