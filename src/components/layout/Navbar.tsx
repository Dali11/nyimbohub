"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut, Menu, X, ChevronDown, Video } from "lucide-react";
import { Music2, Search } from "lucide-react";
import { browse, library, type NavItemData } from "./nav-items";
import { auth } from "@/lib/auth";

// Main five are the core browse links; the remainder live under "More".
const mainLinks = browse.slice(0, 5);
const moreLinks = browse.slice(5);

// Mobile menu = the sidebar links plus Videos (which the sidebar doesn't list)
const mobileBrowse: NavItemData[] = [
  ...browse.slice(0, 2),
  { href: "/videos", label: "Videos", icon: Video },
  ...browse.slice(2),
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = auth.useSession();
  const user = session?.user;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const MobileLink = ({ href, label, icon: Icon }: NavItemData) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
        isActive(href) ? "bg-brand/15 text-brand" : "text-muted"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Music2 className="size-7 text-brand" />
          <span className="text-xl font-bold tracking-tight">
            Nyimbo<span className="text-brand">Hub</span>
          </span>
        </Link>

        {/* Browse links (main five) + "More" for the rest */}
        <div className="flex flex-1 items-center gap-3 py-2 pl-4">
          {mainLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`flex min-w-0 items-center gap-2 whitespace-nowrap px-3 py-3 text-sm transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                isActive(l.href)
                  ? "bg-brand/10 text-brand"
                  : "text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              {l.icon && <l.icon className="size-4 shrink-0" />}
              <span className="truncate">{l.label}</span>
              {isActive(l.href) && (
                <span className="ml-auto h-0.5 flex-1 rounded bg-brand" />
              )}
            </Link>
          ))}
          {moreLinks.length > 0 && (
            <div className="relative">
              <button
                className="flex min-w-0 items-center gap-2 whitespace-nowrap px-3 py-3 text-sm text-muted transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-lg"
                aria-label="More"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
              >
                More
                <ChevronDown
                  className={`size-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open && (
                <div className="absolute right-0 top-full mt-2 min-w-[96px] rounded-lg border border-line bg-surface p-2 shadow-lg">
                  {moreLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center whitespace-nowrap px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-white rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search (shrinks) + auth buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative min-w-0 flex-[1_0_0] max-w-xs">
            <Search className="size-4 shrink-0 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="w-full border border-line bg-surface py-3 pl-8 pr-3 text-sm outline-none placeholder:text-muted focus:border-brand/40 transition-colors"
              placeholder="Search songs, artists..."
            />
          </div>
          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-muted">
                <User className="size-4 text-brand" />
                <span className="hidden text-sm sm:inline">
                  {user.name ?? user.email ?? "User"}
                </span>
              </div>
              <button
                onClick={() => {
                  void auth.signOut();
                }}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-line px-3 py-3 text-sm text-muted hover:bg-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="flex items-center whitespace-nowrap rounded-lg border border-line px-3 py-3 text-sm text-muted hover:bg-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="flex items-center whitespace-nowrap rounded-lg bg-brand px-3 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="flex items-center justify-center rounded-lg p-2 text-muted transition-colors hover:text-white hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile / tablet menu */}
      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-bg px-4 pb-6 pt-3 lg:hidden">
          <div className="mb-3 flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-3 text-sm text-muted">
            <Search className="size-4 shrink-0" />
            <input
              placeholder="Search songs, artists..."
              className="w-full bg-transparent outline-none placeholder:text-muted"
            />
          </div>

          {!user && (
            <div className="mb-3 grid grid-cols-2 gap-3">
              <Link
                href="/sign-in"
                className="flex items-center justify-center rounded-lg border border-line px-4 py-3 text-sm text-muted transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="flex items-center justify-center rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                Sign up
              </Link>
            </div>
          )}
          {user && (
            <div className="mb-3 flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-3 text-sm text-muted">
              <User className="size-4 text-brand" />
              <span className="hidden text-sm sm:inline">
                {user.name ?? user.email ?? "User"}
              </span>
            </div>
          )}

          <nav className="flex flex-col">
            {mobileBrowse.map((i) => (
              <MobileLink key={i.href} {...i} />
            ))}
          </nav>

          <h3 className="mb-1 mt-5 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Your Library
          </h3>
          <nav className="flex flex-col">
            {library.map((i) => (
              <MobileLink key={i.href} {...i} />
            ))}
          </nav>

          <div className="mt-5 flex gap-3 px-3 pb-3">
            {user ? (
              <button
                onClick={() => {
                  void auth.signOut();
                }}
                className="flex items-center gap-2 w-full whitespace-nowrap rounded-lg border border-line px-3 py-3 text-sm text-muted transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center justify-center rounded-lg border border-line px-3 py-3 text-center text-sm text-muted transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
