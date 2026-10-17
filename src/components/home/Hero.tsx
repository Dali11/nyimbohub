"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { Track } from "@/lib/types";
import Cover from "@/components/music/Cover";

type HeroProps = {
  tracks: Track[];
};

const fadeUp = `
  @keyframes heroEntrance {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .hero-enter { animation: heroEntrance 0.6s ease-out both; }
  @media (prefers-reduced-motion: reduce) {
    .hero-enter { animation: none; opacity: 1; transform: none; }
  }
`;

export default function Hero({ tracks }: HeroProps) {
  const { play } = usePlayer();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-surface">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(255,45,143,0.45),transparent_55%),radial-gradient(ellipse_at_95%_80%,rgba(60,90,255,0.45),transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent" />

      {/* Entrance animation */}
      <style jsx>{fadeUp}</style>

      {/* Visual: cluster of top covers (desktop first) */}
      <div className="relative hidden lg:block">
        <div className="relative h-80 w-80 hero-enter">
          {tracks.slice(0, 5).map((track, index) => (
            <div
              key={track.id}
              className="absolute inset-0 rounded-xl shadow-xl overflow-hidden transition-transform duration-500 hover:scale-105"
              style={{
                left: `${12 + index * 16}%`,
                top: `${18 - index * 14}%`,
                transform: `rotate(${index * 6}deg)`,
              }}
            >
              <Cover track={track} variant="md" />
            </div>
          ))}
          {/* Play button for the top track */}
          <button
            type="button"
            onClick={() => play(tracks[0], tracks)}
            className="absolute inset-0 grid place-items-center bg-black/30 rounded-xl opacity-0 transition hover:bg-black/40 group-hover:opacity-100"
            aria-label={`Play ${tracks[0]?.title ?? ""}`}
          >
            <Play className="size-8 fill-white" />
          </button>
        </div>
      </div>

      {/* Mobile: single featured cover (below the text) */}
      <div className="relative mt-10 sm:hidden">
        <div className="relative h-48 w-full overflow-hidden rounded-2xl shadow-xl">
          {tracks[0] && (
            <Cover track={tracks[0]} variant="lg" />
          )}
          <button
            type="button"
            onClick={() => play(tracks[0], tracks)}
            className="absolute inset-0 grid place-items-center bg-black/30 rounded-2xl opacity-0 transition hover:bg-black/40 group-hover:opacity-100"
            aria-label={`Play ${tracks[0]?.title ?? ""}`}
          >
            <Play className="size-8 fill-white" />
          </button>
        </div>
        {tracks[0] && (
          <p className="mt-2 truncate text-sm font-semibold text-white">
            {tracks[0].title}
          </p>
        )}
        {tracks[0] && (
          <p className="truncate text-xs text-muted">{tracks[0].artist}</p>
        )}
      </div>

      {/* Content (headline, copy, buttons) */}
      <div className="relative px-6 py-14 sm:px-12 sm:py-20 lg:max-w-2xl">
        <p className="mb-5 text-xs font-medium tracking-[0.3em] text-muted">
          Malawi&apos;s Music Platform
        </p>
        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Discover
          <br />
          New Sounds
          <br />
          <span className="text-brand">Support Local Talent</span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-white/80">
          Stream, download and watch music from Malawi&apos;s upcoming artists.
          Real music. Real stories. One hub.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/music"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-semibold hover:bg-brand-dark"
          >
            Explore Music <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 rounded-lg border border-brand px-6 py-3 font-semibold hover:bg-brand/10"
          >
            <Play className="size-4 fill-white" /> Watch Videos
          </Link>
        </div>
      </div>
    </section>
  );
}
