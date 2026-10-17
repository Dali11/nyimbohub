"use client";

import Link from "next/link";
import { ArrowRight, Music2, Pause, Play } from "lucide-react";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { Track } from "@/lib/types";

type TrendingNowProps = {
  tracks: Track[];
};

export default function TrendingNow({ tracks }: TrendingNowProps) {
  const { current, isPlaying, play } = usePlayer();

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-3 text-2xl font-bold">
          <span className="h-6 w-1 rounded bg-brand" />
          Trending Now
        </h2>
        <Link
          href="/music"
          className="flex items-center gap-1 text-sm text-muted hover:text-white"
        >
          View All <ArrowRight className="size-4" />
        </Link>
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2">
            <Music2 className="h-6 w-6 text-muted" />
          </div>
          <h3 className="text-lg font-semibold">No trending music yet</h3>
          <p className="mt-2 text-sm text-muted">
            We&apos;re discovering new tracks — come back soon.
          </p>
        </div>
      ) : (
        <div
          className="scrollbar-none flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {tracks.map((t) => {
            const active = current?.id === t.id && isPlaying;
            return (
              <article key={t.id} className="w-40 shrink-0 sm:w-44">
                <div
                  className={`group relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br ${t.gradient}`}
                >
                  <button
                    onClick={() => play(t, tracks)}
                    aria-label={`${active ? "Pause" : "Play"} ${t.title}`}
                    className="absolute bottom-2 right-2 grid size-10 place-items-center rounded-full bg-brand opacity-90 shadow-lg transition group-hover:scale-110"
                  >
                    {active ? (
                      <Pause className="size-4 fill-white" />
                    ) : (
                      <Play className="size-4 fill-white" />
                    )}
                  </button>
                </div>
                <h3 className="mt-2 truncate text-sm font-semibold">
                  {t.title}
                </h3>
                <p className="truncate text-xs text-muted">{t.artist}</p>
              </article>
            );
          })}
        </div>
      )}

    </section>
  );
}
