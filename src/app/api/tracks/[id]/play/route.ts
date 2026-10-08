import { sql, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tracks } from "@/db/schema";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [track] = await db
    .update(tracks)
    .set({
      plays: sql`${tracks.plays} + 1`,
    })
    .where(eq(tracks.id, id))
    .returning({
      id: tracks.id,
      plays: tracks.plays,
    });

  if (!track) {
    return NextResponse.json(
      { error: "Track not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    plays: track.plays,
  });
}
