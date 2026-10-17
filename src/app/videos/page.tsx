import { getVideos } from "@/db/queries";
import VideoBrowser from "@/components/videos/VideoBrowser";
import { formatAgo, formatTime } from "@/lib/format";

export const metadata = { title: "Music Videos — NyimboHub" };

export default async function VideosPage() {
  const rows = await getVideos();

  const videos = rows.map((v) => ({
    id: v.id,
    title: v.title,
    artist: v.artist,
    views: v.views,
    ago: formatAgo(v.createdAt),
    duration: formatTime(v.durationSec),
    gradient: v.gradient,
    tags: v.tags,
  })) as import("@/lib/types").Video[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="mb-5 text-3xl font-bold">Music Videos</h1>
      <VideoBrowser videos={videos} />
    </div>
  );
}
