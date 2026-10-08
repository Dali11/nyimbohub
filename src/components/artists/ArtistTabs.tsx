"use client";

import { useState } from "react";
import type { Artist, Track, Video } from "@/lib/mock-data";
import TrackRow from "@/components/music/TrackRow";
import VideoCard from "@/components/videos/VideoCard";

const tabs = ["Music", "Albums", "Videos", "About"] as const;
type Tab = (typeof tabs)[number];

export default function ArtistTabs({
  artist,
  songs,
  videos,
}: {
  artist: Artist;
  songs: Track[];
  videos: Video[];
}) {
  const [tab, setTab] = useState<Tab>("Music");

  return (
    <>
      <div className="grid grid-cols-4 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative py-3 text-sm transition-colors ${
              tab === t ? "text-brand" : "text-muted hover:text-white"
            }`}
          >
            {t}
            {tab === t && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Music" && (
          <>
            <h2 className="mb-3 flex items-center gap-3 text-xl font-bold">
              <span className="h-5 w-1 rounded bg-brand" />
              Popular Songs
            </h2>
            <div className="space-y-1">
              {songs.map((t, i) => (
                <TrackRow key={t.id} track={t} index={i} queue={songs} />
              ))}
              {songs.length === 0 && (
                <p className="py-8 text-center text-sm text-muted">No songs yet.</p>
              )}
            </div>
          </>
        )}

        {tab === "Albums" && (
          <p className="py-10 text-center text-sm text-muted">No albums yet.</p>
        )}

        {tab === "Videos" &&
          (videos.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted">No videos yet.</p>
          ))}

        {tab === "About" && (
          <div className="max-w-2xl space-y-3">
            <p className="text-white/80">{artist.bio}</p>
            <p className="text-sm text-muted">Based in {artist.location}</p>
          </div>
        )}
      </div>
    </>
  );
}
