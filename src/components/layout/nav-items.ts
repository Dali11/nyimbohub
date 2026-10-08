import {
  House,
  Music,
  Sparkles,
  Flame,
  TrendingUp,
  Disc3,
  Users,
  Tag,
  Heart,
  ListMusic,
  Download,
} from "lucide-react";

export type NavItemData = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const browse: NavItemData[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/music", label: "All Music", icon: Music },
  { href: "/new", label: "New Releases", icon: Sparkles },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/charts", label: "Top Charts", icon: TrendingUp },
  { href: "/albums", label: "Albums", icon: Disc3 },
  { href: "/artists", label: "Artists", icon: Users },
  { href: "/genres", label: "Genres", icon: Tag },
];

export const library: NavItemData[] = [
  { href: "/library/liked", label: "Liked Songs", icon: Heart },
  { href: "/library/playlists", label: "Playlists", icon: ListMusic },
  { href: "/library/downloads", label: "Downloads", icon: Download },
];
