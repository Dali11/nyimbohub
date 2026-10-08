import Link from "next/link";
import { Flame, Music, Disc3, Play, Users } from "lucide-react";

const items = [
  { href: "/trending", icon: Flame, title: "Trending", sub: "Hot right now", color: "text-orange-400 bg-orange-500/15" },
  { href: "/new", icon: Music, title: "New Releases", sub: "Latest music", color: "text-sky-400 bg-sky-500/15" },
  { href: "/albums", icon: Disc3, title: "Albums", sub: "Full projects", color: "text-violet-400 bg-violet-500/15" },
  { href: "/videos", icon: Play, title: "Music Videos", sub: "Watch & enjoy", color: "text-rose-400 bg-rose-500/15" },
  { href: "/artists", icon: Users, title: "Artists", sub: "Discover talent", color: "text-fuchsia-400 bg-fuchsia-500/15" },
];

export default function QuickLinks() {
  return (
    <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(({ href, icon: Icon, title, sub, color }) => (
        <Link
          key={title}
          href={href}
          className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 transition hover:bg-surface-2"
        >
          <span className={`grid size-11 place-items-center rounded-lg ${color}`}>
            <Icon className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">{title}</span>
            <span className="block text-xs text-muted">{sub}</span>
          </span>
        </Link>
      ))}
    </section>
  );
}
