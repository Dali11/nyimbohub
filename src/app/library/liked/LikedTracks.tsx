"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, Music2 } from "lucide-react";
import TrackRow, { trackGrid } from "@/components/music/TrackRow";
import type { Track } from "@/lib/types";

type FavoriteTrack = Track & { createdAt: number; artistSlug: string };

export default function LikedTracks() {
  const [tracks, setTracks] = useState<FavoriteTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/favorites", { cache: "no-store" });
      if (response.status === 401) { setSignedOut(true); setTracks([]); return; }
      if (!response.ok) throw new Error("Failed to load favourites");
      const data = await response.json();
      setTracks(Array.isArray(data.favorites) ? data.favorites : []);
      setSignedOut(false);
    } catch {
      setTracks([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggleFavorite = useCallback(async (trackId: string) => {
    const response = await fetch("/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId }),
    });
    if (response.status === 401) { window.location.href = "/sign-in?callbackURL=/library/liked"; return; }
    if (response.ok) setTracks((current) => current.filter((track) => track.id !== trackId));
  }, []);

  if (loading) return <p className="py-12 text-sm text-muted">Loading your favourites…</p>;
  if (signedOut) return <div className="rounded-2xl border border-line bg-surface/60 px-6 py-12 text-center"><Heart className="mx-auto mb-3 size-8 text-brand" /><h2 className="text-lg font-semibold text-white">Your music, saved</h2><p className="mt-2 text-sm text-muted">Sign in to keep your favourite songs in one place.</p><a href="/sign-in?callbackURL=/library/liked" className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">Sign in</a></div>;
  if (!tracks.length) return <div className="rounded-2xl border border-line bg-surface/60 px-6 py-14 text-center"><Music2 className="mx-auto mb-3 size-8 text-muted" /><h2 className="text-lg font-semibold text-white">No favourites yet</h2><p className="mt-2 text-sm text-muted">Tap the heart beside a song to save it here.</p><a href="/music" className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">Explore music</a></div>;

  return <div className={trackGrid}>{tracks.map((track, index) => <TrackRow key={track.id} track={track} index={index} queue={tracks} isFavorite onToggleFavorite={toggleFavorite} />)}</div>;
}
