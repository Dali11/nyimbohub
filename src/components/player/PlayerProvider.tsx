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
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  toggleShuffle: () => void;
  cycleRepeat: () => void;
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
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("off");

  const load = useCallback((track: Track) => {
    setCurrent(track);
    setProgress(0);
    setDuration(track.durationSec);
    setIsPlaying(Boolean(track.audioUrl));

    // Start a newly selected real track directly from the click/play action.
    // Calling play() only from an effect can lose the browser's user activation
    // and cause the first click to load the track without starting audio.
    const audio = audioRef.current;
    if (audio) {
      if (track.audioUrl) {
        const nextSource = new URL(track.audioUrl, window.location.href).href;
        if (audio.src !== nextSource) {
          audio.src = track.audioUrl;
          audio.load();
        }
        audio.play().catch((error: unknown) => {
          console.error("Audio playback failed:", error);
          setIsPlaying(false);
        });
      } else {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
    }

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

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (current?.audioUrl && audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch((error: unknown) => {
          console.error("Audio playback failed:", error);
          setIsPlaying(false);
        });
      }
      return;
    }
    setIsPlaying((p) => !p);
  }, [current, isPlaying]);

  const play = useCallback(
    (track: Track, q?: Track[]) => {
      if (q) setQueue(q);
      if (current?.id === track.id) {
        const audio = audioRef.current;
        if (track.audioUrl && audio) {
          if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
          } else {
            audio.play().then(() => setIsPlaying(true)).catch((error: unknown) => {
              console.error("Audio playback failed:", error);
              setIsPlaying(false);
            });
          }
        } else {
          setIsPlaying((p) => !p);
        }
        return;
      }
      load(track);
    },
    [current, isPlaying, load]
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!current || queue.length === 0) return;
      const i = queue.findIndex((t) => t.id === current.id);
      if (shuffle && dir === 1 && queue.length > 1) {
        const choices = queue.filter((track) => track.id !== current.id);
        load(choices[Math.floor(Math.random() * choices.length)]);
        return;
      }
      const nextIndex = i + dir;
      if (nextIndex < 0 || nextIndex >= queue.length) {
        if (repeat === "all" || dir === -1) {
          load(queue[(nextIndex + queue.length) % queue.length]);
        } else {
          audioRef.current?.pause();
          setIsPlaying(false);
          setProgress(0);
          if (audioRef.current) audioRef.current.currentTime = 0;
        }
        return;
      }
      load(queue[nextIndex]);
    },
    [current, queue, load, shuffle, repeat]
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }
    step(-1);
  }, [step]);
  const toggleShuffle = useCallback(() => setShuffle((value) => !value), []);
  const cycleRepeat = useCallback(
    () => setRepeat((value) => value === "off" ? "all" : value === "all" ? "one" : "off"),
    []
  );

  const handleEnded = useCallback(() => {
    if (repeat === "one") {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
      setProgress(0);
      return;
    }
    if (current && queue.length > 0) {
      const index = queue.findIndex((track) => track.id === current.id);
      if (shuffle && queue.length > 1) {
        const choices = queue.filter((track) => track.id !== current.id);
        load(choices[Math.floor(Math.random() * choices.length)]);
      } else if (index < queue.length - 1 || repeat === "all") {
        step(1);
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    } else {
      setIsPlaying(false);
    }
  }, [repeat, current, queue, shuffle, load, step]);

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

  // Playback is started synchronously in load()/toggle()/play() so browsers
  // retain the user's click activation. This effect only enforces pause state.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !current?.audioUrl || isPlaying) return;
    a.pause();
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

  const stepQueuedRef = useRef(false);

  useEffect(() => {
    if (current && !current.audioUrl && duration > 0 && progress >= duration) {
      if (!stepQueuedRef.current) {
        stepQueuedRef.current = true;
        setTimeout(() => {
          step(1);
          stepQueuedRef.current = false;
        }, 0);
      }
    } else {
      stepQueuedRef.current = false;
    }
  }, [progress, duration, current, step]);

  const value = useMemo<PlayerState>(
    () => ({ current, isPlaying, progress, duration, volume, play, toggle, next, prev, seek, setVolume, shuffle, repeat, toggleShuffle, cycleRepeat }),
    [current, isPlaying, progress, duration, volume, play, toggle, next, prev, seek, setVolume, shuffle, repeat, toggleShuffle, cycleRepeat]
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
            // Persist the browser's actual media duration, replacing the
            // file-size estimates used when the R2 tracks were first imported.
            if (Math.abs(current.durationSec - Math.round(realDuration)) > 1) {
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
        onEnded={handleEnded}
      />
    </PlayerContext.Provider>
  );
}
