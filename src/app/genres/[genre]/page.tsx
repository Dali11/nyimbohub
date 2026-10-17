import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TrackRow from "@/components/music/TrackRow";
import { getGenres, getTracksByGenre } from "@/db/queries";
import MusicLayout from "../../music/layout";

type Props = { params: Promise<{ genre: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genre } = await params;
  return { title: `${genre} — NyimboHub` };
}

export default async function GenrePage({ params }: Props) {
  const { genre } = await params;

  const rows = await getGenres();
  const selected = rows.find((r) => r.genre === genre);
  if (!selected) notFound();

  const tracks = await getTracksByGenre(genre);

  const trackItems = tracks.map((t) => ({
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
        <Link
          href="/genres"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white"
        >
          <span className="h-5 w-1 rounded bg-brand" />
          All genres
        </Link>
        <h1 className="mb-4 mt-2 text-3xl font-bold">{selected.genre}</h1>
        <p className="text-sm text-muted">
          {selected.count} tracks · ranked by plays
        </p>
        <div className="mt-4 border-b border-line" />
        <div className="space-y-1">
          {trackItems.map((track, index) => (
            <TrackRow key={track.id} track={track} index={index} queue={trackItems} />
          ))}
        </div>
      </div>
    </MusicLayout>
  );
}
