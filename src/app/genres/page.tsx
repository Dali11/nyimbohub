import type { Metadata } from "next";
import Link from "next/link";
import { Disc3 } from "lucide-react";
import { getGenres } from "@/db/queries";
import MusicLayout from "./../music/layout";

export const metadata: Metadata = { title: "Genres — NyimboHub" };

export default async function GenresPage() {
  const rows = await getGenres();

  return (
    <MusicLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <h1 className="mb-6 text-3xl font-bold">Genres</h1>
        <p className="mb-6 text-sm text-muted">
          {rows.length} genres found. Tap a genre to see its tracks.
        </p>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2">
              <Disc3 className="h-6 w-6 text-muted" />
            </div>
            <h3 className="text-lg font-semibold">No genres found</h3>
            <p className="mt-2 text-sm text-muted">Check back soon for new genres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {rows.map((g) => (
              <Link
                key={g.genre}
                href={`/genres/${encodeURIComponent(g.genre)}`}
                className="rounded-2xl border border-line bg-surface p-5 text-center transition hover:bg-surface-2 hover:border-brand/40"
              >
                <h2 className="text-lg font-bold text-white">{g.genre}</h2>
                <p className="mt-1 text-sm text-muted">{g.count} tracks</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MusicLayout>
  );
}
