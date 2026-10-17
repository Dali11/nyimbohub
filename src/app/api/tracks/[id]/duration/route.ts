import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { updateTag } from "next/cache";
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

  // Set-once: a track's duration can only be written when it is currently 0.
  if (track.durationSec !== 0) {
    return NextResponse.json({
      success: true,
      durationSec: track.durationSec,
    });
  }

  await db
    .update(tracks)
    .set({ durationSec })
    .where(eq(tracks.id, id));

  // Invalidate the tracks cache so the new duration is visible next render.
  updateTag("music:tracks");

  return NextResponse.json({
    success: true,
    durationSec,
  });
}
