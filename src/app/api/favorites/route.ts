import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import "server-only";
import { db } from "@/db";
import { artists, favorites, tracks } from "@/db/schema";
import { authServer } from "@/lib/auth-server";

async function getUserId() {
  // Route handlers must use the server auth client so it reads the incoming
  // request cookies instead of the browser-oriented client session cache.
  const result = await authServer.getSession();
  return result?.data?.user?.id ?? null;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Sign in to view your favourites." }, { status: 401 });
    }

    const rows = await db
      .select({
        id: tracks.id,
        title: tracks.title,
        artist: artists.name,
        artistSlug: artists.slug,
        genre: tracks.genre,
        durationSec: tracks.durationSec,
        plays: tracks.plays,
        gradient: tracks.gradient,
        audioKey: tracks.audioKey,
        coverKey: tracks.coverKey,
        createdAt: tracks.createdAt,
      })
      .from(favorites)
      .innerJoin(tracks, eq(favorites.trackId, tracks.id))
      .innerJoin(artists, eq(tracks.artistId, artists.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));

    return NextResponse.json({ favorites: rows.map((track) => ({
      ...track,
      coverUrl: track.coverKey ? `/api/media/cover/${track.id}` : undefined,
      audioUrl: track.audioKey ? `/api/media/audio/${track.id}` : undefined,
      createdAt: track.createdAt.getTime(),
    })) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Failed to load favourites", error);
    return NextResponse.json({ error: "Unable to load favourites." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Sign in to save favourites." }, { status: 401 });

    const body = await request.json().catch(() => null) as { trackId?: unknown } | null;
    const trackId = typeof body?.trackId === "string" ? body.trackId : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trackId)) {
      return NextResponse.json({ error: "A valid track ID is required." }, { status: 400 });
    }

    const [track] = await db.select({ id: tracks.id }).from(tracks).where(eq(tracks.id, trackId)).limit(1);
    if (!track) return NextResponse.json({ error: "Track not found." }, { status: 404 });

    await db.insert(favorites).values({ userId, trackId }).onConflictDoNothing();
    return NextResponse.json({ success: true, trackId });
  } catch (error) {
    console.error("Failed to save favourite", error);
    return NextResponse.json({ error: "Unable to save favourite." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Sign in to manage favourites." }, { status: 401 });

    const body = await request.json().catch(() => null) as { trackId?: unknown } | null;
    const trackId = typeof body?.trackId === "string" ? body.trackId : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trackId)) {
      return NextResponse.json({ error: "A valid track ID is required." }, { status: 400 });
    }

    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.trackId, trackId)));
    return NextResponse.json({ success: true, trackId });
  } catch (error) {
    console.error("Failed to remove favourite", error);
    return NextResponse.json({ error: "Unable to remove favourite." }, { status: 500 });
  }
}
