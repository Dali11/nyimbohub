"use client";

import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRef } from "react";
import { usePlayer } from "./PlayerProvider";
import { formatTime } from "@/lib/format";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function PlayerBar() {
  const {
    current,
    isPlaying,
    progress,
    duration,
    volume,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    shuffle,
    repeat,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer();

  const previousVolumeRef = useRef(0.8);

  if (!current) return null;

  const safeDuration = Math.max(duration || 0, 0);
  const safeProgress = clamp(progress || 0, 0, safeDuration || 0);
  const progressPercent =
    safeDuration > 0 ? (safeProgress / safeDuration) * 100 : 0;

  const muted = volume === 0;

  function toggleMute() {
    if (muted) {
      setVolume(previousVolumeRef.current > 0 ? previousVolumeRef.current : 0.8);
    } else {
      previousVolumeRef.current = volume;
      setVolume(0);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-[60] border-t border-line bg-surface/95 shadow-[0_-10px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:bottom-0">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">

        {/* Desktop player */}
        <div className="hidden min-h-[88px] items-center gap-5 md:flex">

          {/* Track */}
          <div className="flex min-w-0 w-[26%] items-center gap-3">
            <div
              className={`relative size-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${current.gradient} shadow-lg`}
            >
              {current.coverUrl ? (
                <img
                  src={current.coverUrl}
                  alt={`${current.title} cover`}
                  width={56}
                  height={56}
                  loading="eager"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-lg font-black text-white/80">
                  {current.title.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {current.title}
              </p>
              <div className="mt-0.5 flex min-w-0 items-center gap-2">
                <p className="truncate text-xs text-muted">{current.artist}</p>
                <span className={`sound-wave ${isPlaying ? "sound-wave--playing" : ""}`} aria-hidden="true">
                  <span /> <span /> <span /> <span /> <span />
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                type="button"
                onClick={toggleShuffle}
                aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
                aria-pressed={shuffle}
                title={shuffle ? "Shuffle on" : "Shuffle off"}
                className={`grid size-8 place-items-center rounded-full transition ${shuffle ? "bg-brand/15 text-brand" : "text-muted hover:bg-white/5 hover:text-white"}`}
              >
                <Shuffle className="size-4" />
              </button>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous track"
                className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-white/5 hover:text-white"
              >
                <SkipBack className="size-4 fill-current" />
              </button>

              <button
                type="button"
                onClick={toggle}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="grid size-11 place-items-center rounded-full bg-brand text-white shadow-lg shadow-brand/20 transition hover:scale-105 hover:bg-brand-dark active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="size-5 fill-current" />
                ) : (
                  <Play className="ml-0.5 size-5 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Next track"
                className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-white/5 hover:text-white"
              >
                <SkipForward className="size-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={cycleRepeat}
                aria-label={`Repeat ${repeat}`}
                aria-pressed={repeat !== "off"}
                title={`Repeat ${repeat}`}
                className={`relative grid size-8 place-items-center rounded-full transition ${repeat !== "off" ? "bg-brand/15 text-brand" : "text-muted hover:bg-white/5 hover:text-white"}`}
              >
                <Repeat className="size-4" />
                {repeat === "one" && <span className="absolute -right-0.5 -top-0.5 text-[9px] font-bold">1</span>}
              </button>
            </div>

            {/* Progress */}
            <div className="flex w-full max-w-2xl items-center gap-3">
              <span className="w-9 text-right text-[11px] tabular-nums text-muted">
                {formatTime(safeProgress)}
              </span>

              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand transition-[width] duration-75"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <input
                  type="range"
                  min={0}
                  max={safeDuration || 1}
                  step={0.1}
                  value={safeProgress}
                  onChange={(event) => seek(Number(event.target.value))}
                  aria-label="Seek through track"
                  className="relative z-10 h-4 w-full cursor-pointer appearance-none bg-transparent accent-brand"
                />
              </div>

              <span className="w-9 text-[11px] tabular-nums text-muted">
                {formatTime(safeDuration)}
              </span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex w-[26%] items-center justify-end gap-2">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-white/5 hover:text-white"
            >
              {muted ? (
                <VolumeX className="size-4" />
              ) : volume < 0.5 ? (
                <Volume1 className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label="Volume"
              className="w-24 cursor-pointer accent-brand"
            />
          </div>
        </div>

        {/* Mobile player */}
        <div className="flex min-h-[76px] items-center gap-3 md:hidden">
          <div
            className={`relative size-11 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${current.gradient}`}
          >
            {current.coverUrl ? (
              <img
                src={current.coverUrl}
                alt={`${current.title} cover`}
                width={44}
                height={44}
                loading="eager"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-sm font-black text-white/80">
                {current.title.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {current.title}
            </p>

            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-xs text-muted">{current.artist}</p>
              <span className={`sound-wave ${isPlaying ? "sound-wave--playing" : ""}`} aria-hidden="true">
                <span /> <span /> <span /> <span /> <span />
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] tabular-nums text-muted">
                {formatTime(safeProgress)}
              </span>

              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <input
                  type="range"
                  min={0}
                  max={safeDuration || 1}
                  step={0.1}
                  value={safeProgress}
                  onChange={(event) => seek(Number(event.target.value))}
                  aria-label="Seek through track"
                  className="relative z-10 h-4 w-full cursor-pointer appearance-none bg-transparent accent-brand"
                />
              </div>

              <span className="text-[10px] tabular-nums text-muted">
                {formatTime(safeDuration)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={toggleShuffle}
              aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
              aria-pressed={shuffle}
              className={`grid size-8 place-items-center rounded-full ${shuffle ? "text-brand" : "text-muted"}`}
            >
              <Shuffle className="size-4" />
            </button>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous track"
              className="grid size-8 place-items-center rounded-full text-muted active:text-white"
            >
              <SkipBack className="size-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="grid size-10 place-items-center rounded-full bg-brand text-white shadow-lg shadow-brand/20 transition active:scale-95"
            >
              {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next track"
              className="grid size-8 place-items-center rounded-full text-muted active:text-white"
            >
              <SkipForward className="size-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={cycleRepeat}
              aria-label={`Repeat ${repeat}`}
              aria-pressed={repeat !== "off"}
              className={`relative grid size-8 place-items-center rounded-full ${repeat !== "off" ? "text-brand" : "text-muted"}`}
            >
              <Repeat className="size-4" />
              {repeat === "one" && <span className="absolute right-0 top-0 text-[9px] font-bold">1</span>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
