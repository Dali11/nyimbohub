"use client";

import { useMemo, useState } from "react";
import { Music2 } from "lucide-react";
import { genres, type Track } from "@/lib/mock-data";
import TrackRow, { trackGrid } from "./TrackRow";

type MusicTrack = Track & {
  artistSlug?: string;
  audioKey?: string | null;
  coverKey?: string | null;
};

export default function MusicBrowser({
  tracks,
}: {
  tracks: MusicTrack[];
}) {
  const [genre, setGenre] = useState("All");

  const visible = useMemo(() => {
    if (genre === "All") return tracks;

    return tracks.filter((track) => track.genre === genre);
  }, [genre, tracks]);

  return (
    <div>
      {/* Genre filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {genres.map((item) => {
          const active = genre === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => setGenre(item)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                active
                  ? "border-brand bg-brand text-white shadow-lg shadow-brand/20"
                  : "border-line bg-surface text-muted hover:border-brand/50 hover:text-white"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Column headings */}
      <div className="mb-2 grid grid-cols-[44px_minmax(0,1fr)_44px] gap-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted/60 sm:grid-cols-[44px_minmax(0,1fr)_120px_80px_90px] sm:gap-4 sm:px-4">
        <div>#</div>
        <div>Track</div>
        <div className="hidden text-right sm:block">Plays</div>
        <div className="hidden text-right sm:block">Time</div>
        <div />
      </div>

      {/* Tracks */}
      {visible.length > 0 ? (
        <div className={trackGrid}>
          {visible.map((track, index) => (
            <TrackRow
              key={track.id}
              track={track}
              index={index}
              queue={visible}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-surface px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2">
            <Music2 className="h-6 w-6 text-muted" />
          </div>

          <h3 className="text-lg font-semibold text-white">
            No music found
          </h3>

          <p className="mt-2 text-sm text-muted">
            There are no tracks in the {genre} genre yet.
          </p>
        </div>
      )}

      {/* Result count */}
      {visible.length > 0 && (
        <p className="mt-4 text-xs text-muted">
          Showing {visible.length}{" "}
          {visible.length === 1 ? "track" : "tracks"}
        </p>
      )}
    </div>
  );
}
