import { Play } from "lucide-react";
import type { Video } from "@/lib/mock-data";
import { formatPlays } from "@/lib/format";

export default function VideoCard({
  video,
  featured = false,
}: {
  video: Video;
  featured?: boolean;
}) {
  return (
    <article>
      <div
        className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${video.gradient} ${
          featured ? "aspect-video sm:aspect-[21/9]" : "aspect-video"
        }`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <button
          aria-label={`Play ${video.title}`}
          className={`absolute inset-0 m-auto grid place-items-center rounded-full bg-black/50 backdrop-blur transition group-hover:scale-110 ${
            featured ? "size-16" : "size-12"
          }`}
        >
          <Play className="size-6 fill-white" />
        </button>
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs">
          {video.duration}
        </span>
      </div>
      <h3 className={`mt-2 font-semibold ${featured ? "text-lg" : "text-sm"}`}>
        {video.artist} - {video.title}
      </h3>
      <p className="text-xs text-muted">
        {formatPlays(video.views)} views • {video.ago}
      </p>
    </article>
  );
}
