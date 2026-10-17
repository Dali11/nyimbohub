import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import "server-only";
import { db } from "@/db";
import { tracks } from "@/db/schema";
import { r2 } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";

function safeFilename(value: string) {
  return value
    .replace(/[<>:\"/\\\\|?*\\x00-\\x1F]/g, "")
    .replace(/\\s+/g, " ")
    .trim()
    .slice(0, 180);
}

// Public: streaming (GET /api/media/audio/[id]) stays public by default.
// Only the download step requires an authenticated user (Task 4).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Require a signed-in user for the download step.
  const session = await auth.getSession();
  if (!session?.data?.session?.token || !session?.data?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

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

  // Derive the extension and Content-Type from the object rather than hardcoding.
  const ext = (object.ContentType || "audio/mpeg").split("/").pop() ?? "mp3";
  const filename = `${safeFilename(track.title)}.${ext}`;

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
