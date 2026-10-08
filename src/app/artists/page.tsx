import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { artists } from "@/lib/mock-data";
import { formatPlays } from "@/lib/format";

export const metadata = { title: "Artists — NyimboHub" };

export default function ArtistsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold">Artists</h1>

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
              <p className="mt-2 text-xs text-muted">{formatPlays(a.followers)} followers</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
