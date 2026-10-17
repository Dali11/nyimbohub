import type { Metadata } from "next";
import { getNewReleases } from "@/db/queries";
import { Music2 } from "lucide-react";
import TrackRow from "@/components/music/TrackRow";
import MusicLayout from "./../music/layout";

export const metadata: Metadata = { title: "New Releases — NyimboHub" };

export default async function NewReleasesPage() {
  const rows = await getNewReleases();

  const tracks = rows.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    genre: t.genre,
    durationSec: t.durationSec,
    plays: t.plays,
    gradient: t.gradient,
    audioUrl: t.audioKey ? `/api/media/audio/${t.id}` : undefined,
  })) as import("@/lib/types").Track[];

  return (
    <MusicLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <h1 className="mb-6 text-3xl font-bold">New Releases</h1>
        <p className="mb-6 text-sm text-muted">
          The freshest tracks added in the last few weeks, hand-picked for{" "}
          <span className="text-brand">you</span>.
        </p>
        {tracks.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2">
              <Music2 className="h-6 w-6 text-muted" />
            </div>
            <h3 className="text-lg font-semibold">No new releases yet</h3>
            <p className="mt-2 text-sm text-muted">Check back soon for the freshest tracks.</p>
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
