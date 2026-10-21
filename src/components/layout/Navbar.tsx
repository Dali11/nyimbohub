"use client";

import { useState } from "react";
import { usePlayer } from "@/components/player/PlayerProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut, Menu, X } from "lucide-react";
import { Music2, Search } from "lucide-react";
import { browse, library, type NavItemData } from "./nav-items";
import { authClient } from "@/lib/auth-client";

// Mobile menu follows the shared browse navigation.
const mobileBrowse: NavItemData[] = [...browse];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const { current, isPlaying } = usePlayer();
  const user = session?.user;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const MobileLink = ({ href, label, icon: Icon }: NavItemData) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`flex min-w-0 items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm transition-colors ${
        isActive(href) ? "border-brand/20 bg-brand/10 text-brand" : "text-muted hover:border-line hover:bg-surface hover:text-white"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-none items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-2 flex flex-shrink-0 items-center gap-2 lg:mr-6">
          <Music2 className="size-7 text-brand" />
          <span className="text-lg font-bold tracking-tight sm:text-xl">
            Nyimbo<span className="text-brand">Hub</span>
          </span>
        </Link>

        {/* Search, live equalizer, and account actions */}
        <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
          <div className="relative min-w-0 w-[28%] max-w-sm shrink-0">
            <Search className="size-4 shrink-0 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="w-full border border-line bg-surface py-3 pl-8 pr-3 text-sm outline-none placeholder:text-muted focus:border-brand/40 transition-colors"
              placeholder="Search songs, artists..."
            />
          </div>
          {current && (
            <div
              className="ml-1 flex min-w-0 flex-1 items-center gap-1 px-1 py-2"
              title={`${isPlaying ? "Playing" : "Paused"}: ${current.title} — ${current.artist}`}
              aria-label={`${isPlaying ? "Playing" : "Paused"}: ${current.title} by ${current.artist}`}
            >
              <span className={`sound-wave sound-wave--header ${isPlaying ? "sound-wave--playing" : ""}`} aria-hidden="true">
                {Array.from({ length: 48 }, (_, index) => <span key={index} />)}
              </span>
              <span className="shrink-0 truncate text-xs font-medium text-muted">{current.title}</span>
              <span className={`size-1.5 shrink-0 rounded-full ${isPlaying ? "bg-brand" : "bg-muted"}`} aria-hidden="true" />
            </div>
          )}
          <div className="ml-auto flex shrink-0 items-center gap-3">
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
                  void authClient.signOut();
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
        </div>

        <button
          className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface/70 p-2 text-muted transition-colors hover:border-brand/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile / tablet menu */}
      {open && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-bg/98 px-4 pb-6 pt-3 shadow-2xl shadow-black/30 backdrop-blur-xl lg:hidden">
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
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

          <nav className="grid grid-cols-2 gap-1.5">
            {mobileBrowse.map((i) => (
              <MobileLink key={i.href} {...i} />
            ))}
          </nav>

          <h3 className="mb-1 mt-5 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Your Library
          </h3>
          <nav className="grid grid-cols-2 gap-1.5">
            {library.map((i) => (
              <MobileLink key={i.href} {...i} />
            ))}
          </nav>

          <div className="mt-5 flex gap-3 px-3 pb-3">
            {user ? (
              <button
                onClick={() => {
                  void authClient.signOut();
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
