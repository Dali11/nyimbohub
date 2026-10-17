"use client";

import { useMemo, useState } from "react";
import { Clock3, Flame, Music2, Search } from "lucide-react";
import type { Track } from "@/lib/types";
import { genres } from "@/lib/types";
import TrackRow, { trackGrid } from "./TrackRow";

type MusicTrack = Track & {
  artistSlug?: string;
  audioKey?: string | null;
  coverKey?: string | null;
  createdAt?: number;
};

type SortMode = "trending" | "recent" | "title";

const sortOptions: {
  id: SortMode;
  label: string;
  icon: typeof Flame;
}[] = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "recent", label: "Recently added", icon: Clock3 },
  { id: "title", label: "A–Z", icon: Music2 },
];

export default function MusicBrowser({
  tracks,
}: {
  tracks: MusicTrack[];
}) {
  const [genre, setGenre] = useState("All");
  const [sortBy, setSortBy] = useState<SortMode>("trending");
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = tracks.filter((track) => {
      const matchesGenre =
        genre === "All" || track.genre === genre;

      const matchesSearch =
        !term ||
        track.title.toLowerCase().includes(term) ||
        track.artist.toLowerCase().includes(term) ||
        track.genre.toLowerCase().includes(term);

      return matchesGenre && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "recent") {
        return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      }

      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }

      return b.plays - a.plays;
    });
  }, [tracks, genre, search, sortBy]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search songs, artists or genres..."
          aria-label="Search songs, artists or genres"
          className="h-12 w-full rounded-xl border border-line bg-surface pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-muted/70 focus:border-brand"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const active = sortBy === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSortBy(option.id)}
              aria-pressed={active}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-brand bg-brand text-white shadow-lg shadow-brand/20"
                  : "border-line bg-surface text-muted hover:border-brand/50 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </button>
          );
        })}
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Explore by genre
        </p>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {genres.map((item) => {
            const active = genre === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setGenre(item)}
                aria-pressed={active}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-brand/60 bg-brand/10 text-brand"
                    : "border-line bg-surface text-muted hover:border-brand/50 hover:text-white"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">
            {search.trim()
              ? "Search results"
              : sortBy === "recent"
              ? "Recently added"
              : sortBy === "title"
              ? "Browse A–Z"
              : "Trending music"}
          </h2>

          <p className="mt-1 text-xs text-muted">
            {genre === "All" ? "All genres" : genre}
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted">
          {visible.length} {visible.length === 1 ? "track" : "tracks"}
        </span>
      </div>

      <div className="mb-2 grid grid-cols-[44px_minmax(0,1fr)_44px] gap-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted/60 sm:grid-cols-[44px_minmax(0,1fr)_120px_80px_90px] sm:gap-4 sm:px-4">
        <div>#</div>
        <div>Track</div>
        <div className="hidden text-right sm:block">Plays</div>
        <div className="hidden text-right sm:block">Time</div>
        <div />
      </div>

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

          <h3 className="text-lg font-semibold text-white">No music found</h3>

          <p className="mt-2 text-sm text-muted">
            Try another search or choose a different genre.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setGenre("All");
            }}
            className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
