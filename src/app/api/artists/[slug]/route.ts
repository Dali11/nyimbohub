import { NextResponse } from "next/server";
import { getArtistBySlug } from "@/db/queries";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) return NextResponse.json({ error: "Artist not found." }, { status: 404 });

  return NextResponse.json({
    slug: artist.slug,
    name: artist.name,
    location: artist.location,
    verified: artist.verified,
    followers: artist.followers,
    bio: artist.bio,
    gradient: artist.gradient,
  }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}
