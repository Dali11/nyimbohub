import { sql, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { db } from "@/db";
import { tracks } from "@/db/schema";

// Best-effort abuse resistance. A real fix would be a `play_events` table with
// IP/session dedupe; for now we short-circuit repeated plays per track using a
// short-lived httpOnly cookie (30 minutes) so a single client can only inflate
// plays once per track within the window.
const PLAY_COOKIE_TTL = 30 * 60;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [track] = await db
    .select({ id: tracks.id, plays: tracks.plays })
    .from(tracks)
    .where(eq(tracks.id, id))
    .limit(1);

  if (!track) {
    return NextResponse.json(
      { error: "Track not found" },
      { status: 404 },
    );
  }

  const cookieStore = await cookies();
  const alreadyPlayed = cookieStore.get(`play:${id}`);
  if (alreadyPlayed) {
    // Client already counted this track in the window; skip the increment.
    return NextResponse.json({ success: true, plays: track.plays });
  }

  // The existing `plays + 1` SQL update is atomic, so keep it.
  const [updated] = await db
    .update(tracks)
    .set({
      plays: sql`${tracks.plays} + 1`,
    })
    .where(eq(tracks.id, id))
    .returning({
      id: tracks.id,
      plays: tracks.plays,
    });

  // Short-lived, httpOnly cookie to bound abuse (best-effort).
  cookieStore.set(`play:${id}`, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: PLAY_COOKIE_TTL,
  });

  // Revalidate the tracks cache (stale-while-revalidate) so the new play count
  // is visible on the next visit to a music list page.
  revalidateTag("music:tracks", "max");

  return NextResponse.json({
    success: true,
    plays: updated.plays,
  });
}
