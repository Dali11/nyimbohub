# NyimboHub

NyimboHub is a music streaming/discovery platform for Malawi's upcoming artists. It
lets listeners stream, download and watch music (streaming + video), and discover
artists — with the goal of supporting local talent.

## Stack

- **Framework:** Next.js 16 (App Router, `cacheComponents` + `partialPrefetching` enabled)
- **Language:** TypeScript (strict)
- **Database:** Neon Postgres via Drizzle ORM (`drizzle-kit` for migration)
- **Storage:** R2-compatible S3 SDK for audio downloads
- **Auth:** Neon Auth (Better Auth) — sign in / sign up / session reads
- **Styling:** Tailwind CSS (dark theme, brand pink)

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. Names only — no values
are shown here.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection URL (used by `drizzle-kit` and the DB client) |
| `DATABASE_URL_POOLED` | Connection-pooled Neon URL (used by the pooled DB client) |
| `AWS_ENDPOINT_URL_S3` | S3-compatible endpoint for R2 (e.g. `https://<account>.r2.cloudfyy.com`) |
| `AWS_ACCESS_KEY_ID` | S3/R2 access key |
| `AWS_SECRET_ACCESS_KEY` | S3/R2 secret key |
| `AWS_REGION` | S3/R2 region |
| `S3_BUCKET` | R2 bucket name for audio files |
| `NEON_AUTH_URL` | Neon Auth service URL (e.g. `https://<your-auth>.neon.tech`) |
| `NEON_IPV4_WORKAROUND` | Set to `1` to use a hardcoded IPv4 fallback for the Neon API. Default `0` (production uses normal `fetch`). |

> `.env.local` is gitignored and must never be committed. `git secrets` or manual
> review should ensure it stays out of version control.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (`--dns-result-order=ipv4first` and a family-autoselection timeout are applied via `NODE_OPTIONS`) |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx drizzle-kit push` | Push schema changes to the database |
| `npx drizzle-kit migrate` | Run pending migrations |
| `npm run db:seed` | Seed the database with the dev seed fixture (`scripts/seed.ts`) |
| `npm run db:studio` | Open the Drizzle Studio UI |

## Project layout

- `src/app/` — Next.js App Router routes (pages)
- `src/db/` — Drizzle schema, migrations, and query helpers (`getArtists`,
  `getTracksByArtist`, `getVideos`, etc.)
- `src/lib/` — utilities (`format.ts`), R2 client, and the Neon fetch override
- `src/components/` — UI components (player, music browser, artists, videos, layout)
- `scripts/` — dev seed + R2 test utilities
