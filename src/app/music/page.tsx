import MusicBrowser from "@/components/music/MusicBrowser";
import { getMusicTracks } from "@/db/queries";

export default async function MusicPage() {
  const rows = await getMusicTracks();

  const tracks = rows.map((track) => ({
    id: track.id,
    title: track.title,
    artist: track.artist,
    genre: track.genre,
    durationSec: track.durationSec,
    plays: track.plays,
    gradient: track.gradient,
    audioUrl: track.audioKey
      ? `/api/media/audio/${track.id}`
      : undefined,
  }));

  return <MusicBrowser tracks={tracks} />;
}
