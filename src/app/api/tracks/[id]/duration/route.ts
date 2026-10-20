import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/db";
import { tracks } from "@/db/schema";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: { durationSec?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const durationSec = Math.round(Number(body.durationSec));

  if (
    !Number.isFinite(durationSec) ||
    durationSec <= 0 ||
    durationSec > 24 * 60 * 60
  ) {
    return NextResponse.json(
      { error: "Invalid duration" },
      { status: 400 },
    );
  }

  const [track] = await db
    .select({ id: tracks.id, durationSec: tracks.durationSec })
    .from(tracks)
    .where(eq(tracks.id, id))
    .limit(1);

  if (!track) {
    return NextResponse.json(
      { error: "Track not found" },
      { status: 404 },
    );
  }

  // The initial R2 import used file-size estimates. Accept browser-measured
  // media duration so existing incorrect values can be corrected too.
  if (Math.abs(track.durationSec - durationSec) <= 1) {
    return NextResponse.json({ success: true, durationSec: track.durationSec });
  }

  await db
    .update(tracks)
    .set({ durationSec })
    .where(eq(tracks.id, id));

  // Revalidate the tracks cache (stale-while-revalidate) so the new duration
  // is visible on the next visit to a music list page.
  revalidateTag("music:tracks", "max");

  return NextResponse.json({
    success: true,
    durationSec,
  });
}
