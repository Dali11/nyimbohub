import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
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
    .select({ id: tracks.id })
    .from(tracks)
    .where(eq(tracks.id, id))
    .limit(1);

  if (!track) {
    return NextResponse.json(
      { error: "Track not found" },
      { status: 404 },
    );
  }

  await db
    .update(tracks)
    .set({ durationSec })
    .where(eq(tracks.id, id));

  return NextResponse.json({
    success: true,
    durationSec,
  });
}
