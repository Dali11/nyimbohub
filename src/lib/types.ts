export type VideoTag = "latest" | "trending" | "featured";

export type Track = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  durationSec: number;
  plays: number;
  gradient: string;
  audioUrl?: string;
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
