import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export type VideoTag = "latest" | "trending" | "featured";

export const artists = pgTable("artists", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  verified: boolean("verified").notNull().default(false),
  followers: integer("followers").notNull().default(0),
  bio: text("bio").notNull().default(""),
  gradient: text("gradient").notNull().default("from-zinc-500 to-zinc-900"),
  avatarKey: text("avatar_key"), // R2 object key
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tracks = pgTable(
  "tracks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    artistId: uuid("artist_id")
      .notNull()
      .references(() => artists.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    genre: text("genre").notNull(),
    durationSec: integer("duration_sec").notNull().default(0),
    plays: integer("plays").notNull().default(0),
    gradient: text("gradient").notNull().default("from-zinc-500 to-zinc-900"),
    audioKey: text("audio_key"), // R2 object key
    coverKey: text("cover_key"), // R2 object key
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("tracks_artist_idx").on(t.artistId)],
);

export const videos = pgTable(
  "videos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    artistId: uuid("artist_id")
      .notNull()
      .references(() => artists.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    views: integer("views").notNull().default(0),
    durationSec: integer("duration_sec").notNull().default(0),
    gradient: text("gradient").notNull().default("from-zinc-500 to-zinc-900"),
    tags: text("tags")
      .array()
      .$type<VideoTag[]>()
      .notNull()
      .default(sql`'{}'::text[]`),
    videoKey: text("video_key"), // R2 object key
    thumbnailKey: text("thumbnail_key"), // R2 object key
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("videos_artist_idx").on(t.artistId)],
);

export type Artist = typeof artists.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type Video = typeof videos.$inferSelect;
