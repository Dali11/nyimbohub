"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut, Menu, X, Video } from "lucide-react";
import { Music2, Search } from "lucide-react";
import { browse, library, type NavItemData } from "./nav-items";
import { auth } from "@/lib/auth";

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
      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${
        isActive(href) ? "bg-brand/15 text-brand" : "text-muted"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Music2 className="size-7 text-brand" />
          <span className="text-xl font-bold tracking-tight">
            Nyimbo<span className="text-brand">Hub</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-6 md:flex">
          {browse.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative py-5 text-sm transition-colors ${
                isActive(l.href) ? "text-white" : "text-muted hover:text-white"
              }`}
            >
              {l.label}
              {isActive(l.href) && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded bg-brand" />
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden w-full max-w-xs items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-muted lg:flex">
          <Search className="size-4" />
          <input
            placeholder="Search songs, artists, albums..."
            className="w-full bg-transparent outline-none placeholder:text-muted"
          />
        </div>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
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
                className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-muted hover:bg-surface"
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
                className="hidden rounded-lg border border-line px-4 py-2 text-sm hover:bg-surface sm:block"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold hover:bg-brand-dark"
              >
                Sign up
              </Link>
            </>
          )}

          <button
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet menu */}
      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-bg px-4 pb-6 pt-3 lg:hidden">
          <div className="mb-3 flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-muted">
            <Search className="size-4" />
            <input
              placeholder="Search songs, artists..."
              className="w-full bg-transparent outline-none placeholder:text-muted"
            />
          </div>

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
                  className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-muted hover:bg-surface"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="block rounded-lg border border-line px-3 py-3 text-center text-sm sm:hidden"
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
