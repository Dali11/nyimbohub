import type { Metadata } from "next";
import TrackRow from "@/components/music/TrackRow";
import { getCharts } from "@/db/queries";
import MusicLayout from "./../music/layout";

export const metadata: Metadata = { title: "Top Charts — NyimboHub" };

export default async function ChartsPage() {
  const rows = await getCharts();

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
        <h1 className="mb-6 text-3xl font-bold">Top Charts</h1>
        <p className="mb-6 text-sm text-muted">
          The 20 most-played tracks right now — ranked.
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
