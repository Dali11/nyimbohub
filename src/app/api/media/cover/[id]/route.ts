import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import "server-only";

import { db } from "@/db";
import { tracks } from "@/db/schema";
import { getR2DownloadUrl } from "@/lib/r2";

// Next 16 image docs (node_modules/next/dist/docs/01-app/01-getting-started/12-images.md):
// Remote/signed URLs need `remotePatterns` in next.config.ts and `unoptimized` on
// <Image>, which defeats the optimisation. A plain <img> is the right tool here.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [track] = await db
    .select({
      coverKey: tracks.coverKey,
    })
    .from(tracks)
    .where(eq(tracks.id, id))
    .limit(1);

  if (!track?.coverKey) {
    return NextResponse.json({ error: "Cover not found" }, { status: 404 });
  }

  const url = await getR2DownloadUrl(track.coverKey, 120);

  const res = NextResponse.redirect(url);
  // Cache the redirect itself so the browser does not re-request it on every
  // page render; the signed object URL underneath controls how long the actual
  // bytes are cached by the browser/edge.
  res.headers.set("Cache-Control", "public, max-age=120");
  return res;
}
