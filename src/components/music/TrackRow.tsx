"use client";

import Link from "next/link";
import { Check, Download, Heart, Link2, MoreHorizontal, Pause, Play, Share2 } from "lucide-react";
import type { Track } from "@/lib/types";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Cover from "@/components/music/Cover";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type TrackRowProps = {
  track: Track;
  index: number;
  queue: Track[];
  isFavorite?: boolean;
  onToggleFavorite?: (trackId: string) => void | Promise<void>;
};

export const trackGrid =
  "divide-y divide-line/70 overflow-hidden rounded-2xl border border-line/80 bg-surface/65 shadow-xl shadow-black/10";

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

export default function TrackRow({
  track,
  index,
  queue,
  isFavorite,
  onToggleFavorite,
}: TrackRowProps) {
  const { current, isPlaying, play } = usePlayer();
  const { data: session, isPending } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [localFavorite, setLocalFavorite] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const favorite = isFavorite ?? localFavorite;
  const active = current?.id === track.id;
  const playing = active && isPlaying;

  const handleFavoriteClick = async () => {
    if (onToggleFavorite) {
      await onToggleFavorite(track.id);
      return;
    }
    const removing = favorite;
    const response = await fetch("/api/favorites", {
      method: removing ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: track.id }),
    });
    if (response.status === 401) {
      window.location.href = "/sign-in";
      return;
    }
    if (response.ok) setLocalFavorite(!removing);
  };

  const trackUrl = () => `${window.location.origin}/music?track=${encodeURIComponent(track.id)}`;


  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(trackUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this track link", trackUrl());
    }
    setMenuOpen(false);
  };

  const handleShare = async () => {
    const url = trackUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: `${track.title} — ${track.artist}`, url });
      } catch {
        // The user may cancel the native share sheet; no action is needed.
      }
    } else {
      await handleCopyLink();
      return;
    }
    setMenuOpen(false);
  };

  const handleDownload = () => {
    if (!isPending && !session?.user) {
      // Signed-out users are gated at the API layer (401); surface the
      // sign-in page instead of hitting that 401 directly.
      window.location.href = "/sign-in";
      return;
    }
    window.location.href = `/api/media/audio/${track.id}/download`;
  };

  return (
    <div
      id={`track-${track.id}`}
      role="button"
      tabIndex={0}
      onClick={() => play(track, queue)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          play(track, queue);
        }
      }}
      className={`group relative grid min-h-[84px] cursor-pointer grid-cols-[34px_minmax(0,1fr)_92px] items-center gap-3 px-3 transition-colors duration-200 sm:min-h-[88px] sm:grid-cols-[40px_minmax(0,1fr)_90px_76px_112px] sm:gap-4 sm:px-4 ${active ? "bg-brand/[0.09]" : "hover:bg-white/[0.035]"}`}
    >
      {/* Rank */}
      <div
        aria-label={`Rank ${index + 1}`}
        className={`flex items-center justify-center font-mono text-2xl font-black transition-colors sm:text-3xl ${active ? "text-brand/80" : "text-white/15 group-hover:text-white/45"}`}
      >
        {index + 1}
      </div>

      {/* Track identity: play control, artwork and metadata stay aligned. */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            play(track, queue);
          }}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition sm:h-10 sm:w-10 ${playing ? "bg-brand text-white shadow-md shadow-brand/20" : "bg-white/[0.035] text-muted group-hover:bg-brand group-hover:text-white"}`}
        >
          {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
        </button>
        <Cover track={track} variant="md" />
        <div className="min-w-0">
          <p
            className={`truncate text-sm font-semibold transition sm:text-[15px] ${active ? "text-brand" : "text-white group-hover:text-brand"}`}
          >
            {track.title}
          </p>
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
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] tabular-nums text-muted sm:hidden">
              <span aria-hidden="true">·</span> {formatDuration(track.durationSec)}
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
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-brand/10 hover:text-brand sm:h-10 sm:w-10"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            void handleFavoriteClick();
          }}
          aria-label={favorite ? `Remove ${track.title} from favourites` : `Add ${track.title} to favourites`}
          aria-pressed={favorite}
          title={favorite ? "Remove from favourites" : "Save to your account favourites"}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-brand/10 hover:text-brand sm:h-10 sm:w-10 ${favorite ? "text-brand" : "text-muted"}`}
        >
          <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
        </button>
        <div ref={menuRef} className="relative hidden sm:block" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={`More options for ${track.title}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/5 hover:text-white ${menuOpen ? "bg-white/10 text-white" : "text-muted"}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-2xl shadow-black/40">
              <button type="button" role="menuitem" onClick={handleCopyLink} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs text-white transition hover:bg-white/5">
                {copied ? <Check className="size-4 text-emerald-400" /> : <Link2 className="size-4 text-muted" />}
                {copied ? "Link copied" : "Copy track link"}
              </button>
              <button type="button" role="menuitem" onClick={handleShare} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs text-white transition hover:bg-white/5">
                <Share2 className="size-4 text-muted" /> Share track
              </button>
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); handleDownload(); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs text-white transition hover:bg-white/5">
                <Download className="size-4 text-muted" /> Download audio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
