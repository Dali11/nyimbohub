import type { Metadata } from "next";
import { getNewReleases } from "@/db/queries";
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
        <div className="space-y-1">
          {tracks.map((track, index) => (
            <TrackRow key={track.id} track={track} index={index} queue={tracks} />
          ))}
        </div>
      </div>
    </MusicLayout>
  );
}
