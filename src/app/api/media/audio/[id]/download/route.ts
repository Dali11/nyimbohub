import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tracks } from "@/db/schema";
import { r2 } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";

function safeFilename(value: string) {
  return value
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [track] = await db
    .select({
      title: tracks.title,
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

  const object = await r2.send(
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: track.audioKey,
    }),
  );

  if (!object.Body) {
    return NextResponse.json(
      { error: "Audio file unavailable" },
      { status: 404 },
    );
  }

  const filename = `${safeFilename(track.title)}.mp3`;

  return new NextResponse(object.Body.transformToWebStream(), {
    status: 200,
    headers: {
      "Content-Type": object.ContentType || "audio/mpeg",
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...(object.ContentLength
        ? { "Content-Length": String(object.ContentLength) }
        : {}),
      "Cache-Control": "private, no-cache",
    },
  });
}
