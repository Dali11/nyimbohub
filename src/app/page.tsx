import Hero from "@/components/home/Hero";
import QuickLinks from "@/components/home/QuickLinks";
import TrendingNow from "@/components/home/TrendingNow";
import { getMusicTracks } from "@/db/queries";

export default async function HomePage() {
  const rows = await getMusicTracks();

  const tracks = rows.slice(0, 6).map((track) => ({
    id: track.id,
    title: track.title,
    artist: track.artist,
    genre: track.genre,
    durationSec: track.durationSec,
    plays: track.plays,
    gradient: track.gradient,
    coverUrl: track.coverKey ? `/api/media/cover/${track.id}` : undefined,
    audioUrl: track.audioKey ? `/api/media/audio/${track.id}` : undefined,
  })) as import("@/lib/types").Track[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Hero tracks={tracks} />
      <QuickLinks />
      <TrendingNow tracks={tracks} />
    </div>
  );
}
