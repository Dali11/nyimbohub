"use client";

import Link from "next/link";
import { Download, Heart, MoreHorizontal, Pause, Play } from "lucide-react";
import type { Track } from "@/lib/types";
import { usePlayer } from "@/components/player/PlayerProvider";
import { auth } from "@/lib/auth";

type TrackRowProps = {
  track: Track;
  index: number;
  queue: Track[];
};

export const trackGrid =
  "divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatPlays(plays: number) {
  if (plays >= 1_000_000) {
    return `${(plays / 1_000_000).toFixed(1)}M`;
  }

  if (plays >= 1_000) {
    return `${Math.round(plays / 1_000)}K`;
  }

  return plays.toString();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function TrackRow({
  track,
  index,
  queue,
}: TrackRowProps) {
  const { current, isPlaying, play } = usePlayer();
  const { data: session, isPending } = auth.useSession();

  const active = current?.id === track.id;
  const playing = active && isPlaying;

  const handleDownload = () => {
    if (!isPending && !session?.user) {
      // Task 4: signed-out users are gated at the API layer (401); surface the
      // sign-in page instead of hitting that 401 directly.
      window.location.href = "/sign-in";
      return;
    }
    window.location.href = `/api/media/audio/${track.id}/download`;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => play(track, queue)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          play(track, queue);
        }
      }}
      className={`group grid min-h-[82px] cursor-pointer grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3 px-3 transition-colors sm:grid-cols-[44px_minmax(0,1fr)_120px_80px_90px] sm:gap-4 sm:px-4 ${
        active ? "bg-brand/10" : "hover:bg-white/[0.035]"
      }`}
    >
      {/* Play */}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          play(track, queue);
        }}
        aria-label={
          playing ? `Pause ${track.title}` : `Play ${track.title}`
        }
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
          playing
            ? "bg-brand text-white"
            : "text-muted hover:bg-brand hover:text-white"
        }`}
      >
        {playing ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current" />
        )}
      </button>

      {/* Artwork + song */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${track.gradient} shadow-lg`}
        >
          <span className="text-sm font-bold text-white/90">
            {track.title.slice(0, 1).toUpperCase()}
          </span>
        </div>

        <div className="min-w-0">
          {/* TITLE — clicking this plays the track */}
          <p
            className={`truncate text-sm font-semibold transition ${
              active
                ? "text-brand"
                : "text-white group-hover:text-brand"
            }`}
          >
            {track.title}
          </p>

          {/* ARTIST — this is the only artist link */}
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <Link
              href={`/artists/${slugify(track.artist)}`}
              onClick={(event) => event.stopPropagation()}
              className="truncate text-xs text-muted hover:text-white"
            >
              {track.artist}
            </Link>

            <span className="hidden shrink-0 text-[10px] text-muted/50 sm:inline">
              •
            </span>

            <span className="hidden shrink-0 text-[11px] text-muted sm:inline">
              {track.genre}
            </span>

            <span className="text-[11px] tabular-nums text-muted sm:hidden">
              • {formatDuration(track.durationSec)}
            </span>
          </div>
        </div>
      </div>

      {/* Plays */}
      <div className="hidden text-right text-xs text-muted sm:block">
        {formatPlays(track.plays)}
      </div>

      {/* Duration */}
      <div className="hidden text-right text-xs tabular-nums text-muted sm:block">
        {formatDuration(track.durationSec)}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-1">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleDownload();
          }}
          aria-label={`Download ${track.title}`}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-white/5 hover:text-white"
        >
          <Download className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          aria-label={`Like ${track.title}`}
          className="hidden h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-white/5 hover:text-white sm:flex"
        >
          <Heart className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          aria-label={`More options for ${track.title}`}
          className="hidden h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-white/5 hover:text-white sm:flex"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
