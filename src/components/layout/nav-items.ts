import { House, Music, Sparkles, Flame, TrendingUp, Tag, Heart } from "lucide-react";

export type NavItemData = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

// Planned — no data model yet; links removed from the nav (see report).
// - /albums — Albums
// - /library/liked — Liked Songs
// - /library/playlists — Playlists
// - /library/downloads — Downloads
export const browse: NavItemData[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/music", label: "All Music", icon: Music },
  { href: "/new", label: "New Releases", icon: Sparkles },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/charts", label: "Top Charts", icon: TrendingUp },
  { href: "/genres", label: "Genres", icon: Tag },
];

export const library: NavItemData[] = [
  { href: "/library/liked", label: "Favourites", icon: Heart },
];
