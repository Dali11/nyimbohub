"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock3, Flame, Music2, Search, X, Sparkles } from "lucide-react";
import type { Track } from "@/lib/types";
import { genres } from "@/lib/types";
import TrackRow, { trackGrid } from "./TrackRow";
import ArtistInfoPanel from "./ArtistInfoPanel";

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
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const trackId = new URLSearchParams(window.location.search).get("track");
    if (!trackId) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`track-${trackId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/favorites", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!cancelled && Array.isArray(data?.favorites)) {
          setFavoriteIds(data.favorites.map((track: { id: string }) => track.id));
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  const toggleFavorite = useCallback(async (trackId: string) => {
    const removing = favoriteIds.includes(trackId);
    const response = await fetch("/api/favorites", {
      method: removing ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId }),
    });
    if (response.status === 401) {
      window.location.href = "/sign-in?callbackURL=/music";
      return;
    }
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      window.alert(result?.error || "Could not update favourites. Please try again.");
      return;
    }
    setFavoriteIds((current) => removing ? current.filter((id) => id !== trackId) : current.includes(trackId) ? current : [...current, trackId]);
  }, [favoriteIds]);

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
    <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
    <div className="min-w-0 space-y-5">
      {/* Sticky discovery controls stay below the global navigation. */}
      <div className="sticky top-16 z-40 -mx-4 space-y-4 border-b border-line/80 bg-bg/95 px-4 pb-4 pt-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search songs, artists or genres..."
            aria-label="Search songs, artists or genres"
            className="h-12 w-full rounded-xl border border-line bg-surface/90 pl-12 pr-11 text-sm text-white outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
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
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
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
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Explore by genre</p>
            <span className="shrink-0 text-xs text-muted">{genre === "All" ? "All genres" : genre}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {genres.map((item) => {
              const active = genre === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGenre(item)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                    active
                      ? "border-brand/60 bg-brand/15 text-brand"
                      : "border-line/80 bg-surface/70 text-muted hover:border-brand/50 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 pt-1">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand/90">
            <Sparkles className="size-3.5" /> NyimboHub selection
          </div>
          <h2 className="text-lg font-bold text-white sm:text-xl">
            {search.trim()
              ? "Search results"
              : sortBy === "recent"
              ? "Recently added"
              : sortBy === "title"
              ? "Browse A–Z"
              : "Trending music"}
          </h2>
          <p className="mt-1 text-xs text-muted">{genre === "All" ? "Discover music from Malawi" : `Browsing ${genre}`}</p>
        </div>
        <span className="shrink-0 rounded-full border border-line/80 bg-surface/80 px-3 py-1.5 text-xs tabular-nums text-muted">
          {visible.length} {visible.length === 1 ? "track" : "tracks"}
        </span>
      </div>

      <div className="grid grid-cols-[34px_minmax(0,1fr)_92px] gap-3 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted/60 sm:grid-cols-[40px_minmax(0,1fr)_90px_76px_112px] sm:gap-4 sm:px-4">
        <div className="text-center">#</div>
        <div>Track</div>
        <div className="hidden text-right sm:block">Plays</div>
        <div className="hidden text-right sm:block">Time</div>
        <div className="text-right">Actions</div>
      </div>

      {visible.length > 0 ? (
        <div className={trackGrid}>
          {visible.map((track, index) => (
            <TrackRow key={track.id} track={track} index={index} queue={visible} isFavorite={favoriteIds.includes(track.id)} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-surface px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2">
            <Music2 className="h-6 w-6 text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-white">No music found</h3>
          <p className="mt-2 text-sm text-muted">Try another search or choose a different genre.</p>
          <button
            type="button"
            onClick={() => { setSearch(""); setGenre("All"); }}
            className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
    <ArtistInfoPanel />
    </div>
  );
}
