import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  primaryKey,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export type VideoTag = "latest" | "trending" | "featured";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (t) => [index("session_user_idx").on(t.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("account_user_idx").on(t.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("verification_identifier_idx").on(t.identifier)]);


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



export const favorites = pgTable(
  "favorites",
  {
    userId: text("user_id").notNull(),
    trackId: uuid("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.trackId] }),
    index("favorites_user_idx").on(t.userId),
  ],
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
export type Favorite = typeof favorites.$inferSelect;
export type Video = typeof videos.$inferSelect;
