"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Music, Video, Users, Library } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: House },
  { href: "/music", label: "Music", icon: Music },
  { href: "/videos", label: "Videos", icon: Video },
  { href: "/artists", label: "Artists", icon: Users },
  { href: "/library", label: "Library", icon: Library },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 h-16 border-t border-line bg-surface/95 backdrop-blur md:hidden">
      <ul className="grid h-full grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
