"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Track } from "@/lib/types";

type PlayerState = {
  current: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  play: (track: Track, queue?: Track[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

export function usePlayer(): PlayerState {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

export default function PlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const countedTracksRef = useRef(new Set<string>());
  const [current, setCurrent] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  const load = useCallback((track: Track) => {
    setCurrent(track);
    setProgress(0);
    setDuration(track.durationSec);
    setIsPlaying(true);

    // Count a real uploaded track once per browser session.
    if (track.audioUrl && !countedTracksRef.current.has(track.id)) {
      countedTracksRef.current.add(track.id);

      fetch(`/api/tracks/${track.id}/play`, {
        method: "POST",
      })
        .then(async (response) => {
          if (!response.ok) return;

          const data = (await response.json()) as {
            plays?: number;
          };

          if (typeof data.plays === "number") {
            const updatedPlays = data.plays;

            setCurrent((currentTrack) =>
              currentTrack?.id === track.id
                ? { ...currentTrack, plays: updatedPlays }
                : currentTrack,
            );
          }
        })
        .catch(() => {
          // Play-count tracking must never interrupt playback.
        });
    }
  }, []);

  const toggle = useCallback(() => setIsPlaying((p) => !p), []);

  const play = useCallback(
    (track: Track, q?: Track[]) => {
      if (q) setQueue(q);
      if (current?.id === track.id) {
        setIsPlaying((p) => !p);
        return;
      }
      load(track);
    },
    [current, load]
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!current || queue.length === 0) return;
      const i = queue.findIndex((t) => t.id === current.id);
      load(queue[(i + dir + queue.length) % queue.length]);
    },
    [current, queue, load]
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  const seek = useCallback(
    (seconds: number) => {
      setProgress(seconds);
      if (audioRef.current && current?.audioUrl) {
        audioRef.current.currentTime = seconds;
      }
    },
    [current]
  );

  const setVolume = useCallback((v: number) => setVolumeState(v), []);

  // Load the real audio source when the track changes
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (current?.audioUrl) {
      a.src = current.audioUrl;
    } else {
      a.removeAttribute("src");
      a.load();
    }
  }, [current]);

  // Play / pause the real audio element
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !current?.audioUrl) return;
    if (isPlaying) a.play().catch(() => setIsPlaying(false));
    else a.pause();
  }, [isPlaying, current]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Simulated playback for tracks with no audioUrl yet
  useEffect(() => {
    if (!isPlaying || !current || current.audioUrl) return;
    const id = setInterval(() => setProgress((p) => p + 0.25), 250);
    return () => clearInterval(id);
  }, [isPlaying, current]);

  useEffect(() => {
    if (current && !current.audioUrl && duration > 0 && progress >= duration) {
      step(1);
    }
  }, [progress, duration, current, step]);

  const value = useMemo<PlayerState>(
    () => ({ current, isPlaying, progress, duration, volume, play, toggle, next, prev, seek, setVolume }),
    [current, isPlaying, progress, duration, volume, play, toggle, next, prev, seek, setVolume]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const realDuration = e.currentTarget.duration;

          setDuration(realDuration);

          if (
            current?.audioUrl &&
            Number.isFinite(realDuration) &&
            realDuration > 0
          ) {
            // `durationSec` is set-once (only written when it is currently 0),
            // so only send the PATCH for a track that has no duration yet.
            if (current.durationSec === 0) {
              fetch(`/api/tracks/${current.id}/duration`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  durationSec: realDuration,
                }),
              }).catch(() => {
                // Duration persistence is non-critical to playback.
              });
            }
          }
        }}
        onEnded={() => step(1)}
      />
    </PlayerContext.Provider>
  );
}
