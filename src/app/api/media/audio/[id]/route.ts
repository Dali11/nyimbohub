import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { tracks } from "@/db/schema";
import { getR2DownloadUrl } from "@/lib/r2";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [track] = await db
    .select({
      audioKey: tracks.audioKey,
    })
    .from(tracks)
    .where(eq(tracks.id, id))
    .limit(1);

  if (!track?.audioKey) {
    return NextResponse.json(
      { error: "Audio not found" },
      { status: 404 },
    );
  }

  const url = await getR2DownloadUrl(track.audioKey, 300);

  return NextResponse.redirect(url);
}
