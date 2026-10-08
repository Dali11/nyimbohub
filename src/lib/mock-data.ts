export type Track = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  durationSec: number;
  plays: number;
  gradient: string; // placeholder artwork until real images exist
  audioUrl?: string; // set a real URL to play real audio; otherwise playback is simulated
};

export type Artist = {
  slug: string;
  name: string;
  location: string;
  verified: boolean;
  followers: number;
  bio: string;
  gradient: string;
};

export type VideoTag = "latest" | "trending" | "featured";

export type Video = {
  id: string;
  title: string;
  artist: string;
  views: number;
  ago: string;
  duration: string;
  gradient: string;
  tags: VideoTag[];
};

export const genres = ["All", "Afrobeat", "Hip Hop", "Gospel", "Dancehall", "Traditional"];

export const tracks: Track[] = [
  { id: "1", title: "Ndimayenda", artist: "Young Blaze", genre: "Hip Hop", durationSec: 222, plays: 1_200_000, gradient: "from-orange-500 to-amber-900" },
  { id: "2", title: "Chikondi", artist: "Tiyeni", genre: "Afrobeat", durationSec: 250, plays: 980_000, gradient: "from-pink-500 to-red-900" },
  { id: "3", title: "Zikomo", artist: "Jah Keys", genre: "Gospel", durationSec: 238, plays: 750_000, gradient: "from-amber-500 to-stone-900" },
  { id: "4", title: "Mzimu Wanga", artist: "Lulu", genre: "Afrobeat", durationSec: 206, plays: 640_000, gradient: "from-cyan-500 to-purple-900" },
  { id: "5", title: "Tisinthe", artist: "MC Phiri", genre: "Hip Hop", durationSec: 245, plays: 520_000, gradient: "from-orange-400 to-rose-900" },
  { id: "6", title: "Nthawi Yathu", artist: "The Movement", genre: "Dancehall", durationSec: 215, plays: 410_000, gradient: "from-sky-500 to-indigo-900" },
  { id: "7", title: "Mulungu Ndiwe", artist: "Chisomo", genre: "Gospel", durationSec: 261, plays: 330_000, gradient: "from-yellow-400 to-orange-900" },
  { id: "8", title: "Ngoma", artist: "Mwai", genre: "Traditional", durationSec: 198, plays: 290_000, gradient: "from-emerald-500 to-teal-900" },
  { id: "9", title: "Tikondwere", artist: "Lulu", genre: "Dancehall", durationSec: 189, plays: 240_000, gradient: "from-fuchsia-500 to-violet-900" },
  { id: "10", title: "Kwathu", artist: "Mwai", genre: "Traditional", durationSec: 274, plays: 180_000, gradient: "from-lime-500 to-green-900" },
];

export const trending: Track[] = tracks.slice(0, 6);

export const artists: Artist[] = [
  { slug: "young-blaze", name: "Young Blaze", location: "Lilongwe, Malawi", verified: true, followers: 12_000, gradient: "from-orange-500 to-amber-900", bio: "Hip hop artist from Lilongwe telling everyday Malawian stories over heavy, melodic beats." },
  { slug: "tiyeni", name: "Tiyeni", location: "Blantyre, Malawi", verified: false, followers: 8_400, gradient: "from-pink-500 to-red-900", bio: "Afrobeat singer-songwriter blending Chichewa lyrics with modern production." },
  { slug: "jah-keys", name: "Jah Keys", location: "Zomba, Malawi", verified: false, followers: 6_100, gradient: "from-amber-500 to-stone-900", bio: "Gospel artist and keyboardist known for uplifting, worship-led records." },
  { slug: "lulu", name: "Lulu", location: "Mzuzu, Malawi", verified: false, followers: 5_300, gradient: "from-cyan-500 to-purple-900", bio: "Vocalist moving between Afrobeat and dancehall with a distinctive northern sound." },
  { slug: "mc-phiri", name: "MC Phiri", location: "Lilongwe, Malawi", verified: false, followers: 4_700, gradient: "from-orange-400 to-rose-900", bio: "Rapper with sharp storytelling and a loyal Lilongwe following." },
  { slug: "the-movement", name: "The Movement", location: "Blantyre, Malawi", verified: false, followers: 3_900, gradient: "from-sky-500 to-indigo-900", bio: "Dancehall collective bringing high-energy performances to the stage." },
  { slug: "chisomo", name: "Chisomo", location: "Mzuzu, Malawi", verified: false, followers: 2_800, gradient: "from-yellow-400 to-orange-900", bio: "Gospel singer with a warm, powerful voice." },
  { slug: "mwai", name: "Mwai", location: "Ntcheu, Malawi", verified: false, followers: 2_100, gradient: "from-emerald-500 to-teal-900", bio: "Traditional music artist keeping Malawian rhythms and instruments alive." },
];

export const videos: Video[] = [
  { id: "v1", title: "Ndimayenda (Official Video)", artist: "Young Blaze", views: 1_200_000, ago: "2 weeks ago", duration: "4:12", gradient: "from-orange-500 to-amber-900", tags: ["featured", "trending"] },
  { id: "v2", title: "Chikondi (Official Video)", artist: "Tiyeni", views: 980_000, ago: "3 weeks ago", duration: "3:58", gradient: "from-pink-500 to-red-900", tags: ["trending"] },
  { id: "v3", title: "Zikomo (Official Video)", artist: "Jah Keys", views: 640_000, ago: "1 month ago", duration: "4:20", gradient: "from-sky-500 to-indigo-900", tags: ["featured"] },
  { id: "v4", title: "Mzimu Wanga (Official Video)", artist: "Lulu", views: 410_000, ago: "5 days ago", duration: "3:30", gradient: "from-cyan-500 to-purple-900", tags: ["latest", "trending"] },
  { id: "v5", title: "Tisinthe (Official Video)", artist: "MC Phiri", views: 320_000, ago: "1 day ago", duration: "4:05", gradient: "from-orange-400 to-rose-900", tags: ["latest"] },
  { id: "v6", title: "Nthawi Yathu (Official Video)", artist: "The Movement", views: 210_000, ago: "3 days ago", duration: "3:44", gradient: "from-fuchsia-500 to-violet-900", tags: ["latest"] },
];

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getArtist(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}

export function tracksByArtist(name: string): Track[] {
  return tracks.filter((t) => t.artist === name);
}

export function videosByArtist(name: string): Video[] {
  return videos.filter((v) => v.artist === name);
}
