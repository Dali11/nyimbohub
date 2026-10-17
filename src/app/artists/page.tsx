import Link from "next/link";
import { BadgeCheck, Users } from "lucide-react";
import { getArtists } from "@/db/queries";
import { formatPlays } from "@/lib/format";

export const metadata = { title: "Artists — NyimboHub" };

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold">Artists</h1>

      {artists.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2">
            <Users className="h-6 w-6 text-muted" />
          </div>
          <h3 className="text-lg font-semibold">No artists yet</h3>
          <p className="mt-2 text-sm text-muted">Check back soon for new talent.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {artists.map((a) => {
            const initials = a.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2);
            return (
              <Link
                key={a.slug}
                href={`/artists/${a.slug}`}
                className="rounded-2xl border border-line bg-surface p-5 text-center transition hover:bg-surface-2"
              >
                <div
                  className={`mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-br ${a.gradient} text-2xl font-bold`}
                >
                  {initials}
                </div>
                <h2 className="mt-4 flex items-center justify-center gap-1 font-semibold">
                  {a.name}
                  {a.verified && <BadgeCheck className="size-4 text-brand" />}
                </h2>
                <p className="text-xs text-muted">{a.location}</p>
                <p className="mt-2 text-xs text-muted">
                  {formatPlays(a.followers)} followers
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
