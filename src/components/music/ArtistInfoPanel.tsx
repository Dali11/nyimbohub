"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeCheck, Headphones, MapPin, Music2, Play, Radio } from "lucide-react";
import { usePlayer } from "@/components/player/PlayerProvider";
import Cover from "@/components/music/Cover";
import type { Track } from "@/lib/types";

type PlayingTrack = Track & { artistSlug?: string };
type ArtistInfo = {
  slug: string;
  name: string;
  location: string;
  verified: boolean;
  followers: number;
  bio: string;
  gradient: string;
};

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export default function ArtistInfoPanel() {
  const { current } = usePlayer();
  const track = current as PlayingTrack | null;
  const [artist, setArtist] = useState<ArtistInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!track?.artistSlug) {
      setArtist(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/artists/${encodeURIComponent(track.artistSlug)}`)
      .then(async (response) => response.ok ? response.json() as Promise<ArtistInfo> : null)
      .then((data) => { if (!cancelled) setArtist(data); })
      .catch(() => { if (!cancelled) setArtist(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [track?.artistSlug]);

  if (!track) {
    return (
      <aside className="hidden w-[290px] shrink-0 xl:block">
        <div className="sticky top-20 rounded-2xl border border-line/80 bg-surface/55 p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted"><Radio className="size-4 text-brand" /> Now playing</div>
          <div className="grid aspect-square place-items-center rounded-xl border border-line/70 bg-gradient-to-br from-brand/15 via-surface to-surface-2"><Music2 className="size-12 text-brand/70" /></div>
          <h2 className="mt-5 text-lg font-semibold text-white">Your next favourite starts here</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Play a song to see its artwork, track details and artist information here.</p>
        </div>
      </aside>
    );
  }

  const initials = (artist?.name ?? track.artist).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="hidden w-[290px] shrink-0 xl:block">
      <div className="sticky top-20 space-y-4">
        <section className="overflow-hidden rounded-2xl border border-line/80 bg-surface/60 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between border-b border-line/70 px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Now playing</span>
            <Headphones className="size-4 text-brand" />
          </div>
          <div className="p-4">
            <div className="overflow-hidden rounded-xl border border-line/60 bg-surface-2">
              <Cover track={track} variant="lg" rounded={false} className="!h-auto !w-full aspect-square shadow-none" />
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0"><h2 className="truncate text-lg font-bold text-white">{track.title}</h2><p className="mt-1 line-clamp-2 text-sm text-muted">{track.artist}</p></div>
              <span className="mt-1 rounded-full bg-brand/10 px-2 py-1 text-[10px] font-semibold text-brand">{track.genre}</span>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-line/80 bg-surface/60 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between border-b border-line/70 px-4 py-3"><span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">About the artist</span><Music2 className="size-4 text-brand" /></div>
          <div className="p-4">
            <div className={`grid aspect-[2/1] place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${artist?.gradient ?? "from-zinc-600 to-zinc-950"}`}>
              <div className="grid size-20 place-items-center rounded-full border border-white/20 bg-black/15 text-2xl font-bold text-white shadow-lg">{initials}</div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <h3 className="min-w-0 truncate text-base font-bold text-white">{artist?.name ?? track.artist}</h3>
              {artist?.verified && <BadgeCheck className="size-4 shrink-0 fill-brand/15 text-brand" aria-label="Verified artist" />}
            </div>
            {artist?.location && <p className="mt-1 flex items-center gap-1.5 text-xs text-muted"><MapPin className="size-3.5" />{artist.location}</p>}
            {artist && <p className="mt-2 text-xs text-muted">{compactNumber(artist.followers)} followers</p>}
            <p className="mt-3 text-sm leading-6 text-muted">{loading ? "Loading artist details…" : artist?.bio || "Discover more music from this artist on NyimboHub."}</p>
            {track.artistSlug ? <Link href={`/artists/${track.artistSlug}`} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-white transition hover:border-brand/60 hover:bg-brand/10"><Play className="size-3.5 fill-current" /> View artist profile</Link> : <p className="mt-4 text-xs text-muted">Artist profile not available for this track yet.</p>}
          </div>
        </section>
      </div>
    </aside>
  );
}
