"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { browse, library, type NavItemData } from "./nav-items";

function NavItem({ href, label, icon: Icon, active }: NavItemData & { active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-brand/15 text-brand"
          : "text-muted hover:bg-surface hover:text-white"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 overflow-y-auto py-6 lg:block">
      <nav className="space-y-1">
        {browse.map((i) => (
          <NavItem
            key={i.href}
            {...i}
            active={i.href === "/" ? pathname === "/" : pathname.startsWith(i.href)}
          />
        ))}
      </nav>

      <h3 className="mb-2 mt-8 px-3 text-sm font-semibold">Your Library</h3>
      <nav className="space-y-1">
        {library.map((i) => (
          <NavItem key={i.href} {...i} active={pathname.startsWith(i.href)} />
        ))}
      </nav>
    </aside>
  );
}
