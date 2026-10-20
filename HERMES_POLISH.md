# NyimboHub: polish phase (navbar, dead links, hero, cover art)

Read this whole file first. Do the tasks in order, one commit per task.

## Ground rules

- **Read the code before changing it.** The earlier hardening work changed several files, so don't rely on memory of how things used to look. Open each file you plan to touch.
- **Next.js here is not the version you know.** Next 16.4 with `cacheComponents` is on. Read the relevant guide in `node_modules/next/dist/docs/` before writing routing, caching, image or route-handler code.
- **Never open, print or modify `.env.local` or `.env.local.bak`.** Don't touch `test-audio/` or `.phase2-backup-*/`.
- Use the existing design tokens in `src/app/globals.css` (`bg`, `surface`, `surface-2`, `line`, `brand` pink, `brand-dark`, `muted`). Keep the dark theme and the pink/violet identity. Don't introduce new colours without a reason.
- No new dependencies unless you tell me why first. Prefer CSS and Tailwind over an animation library.
- Respect `prefers-reduced-motion` for any animation you add.
- Everything must work at **402px wide (phone), 768px, 1024px and 1440px.** Touch targets on mobile must be at least 44px.
- After each task run `npx tsc --noEmit` and `npm run lint`. After the last task also run `npm run build`. You can't reach the database from your environment, so **say clearly what you could not verify** and don't claim the build or the visuals work if you didn't see them.
- If a task needs a product decision, use the default given, note it, and move on.

## Task 1: Fix the dead navigation links

The nav (`src/components/layout/nav-items.ts`, `Navbar.tsx`, `Sidebar.tsx`, `MobileTabBar.tsx`) links to pages that don't exist. List every link, then check each against the real routes under `src/app`.

**Build these pages** (they only need queries and layouts that already exist):

- `/new` (New Releases): tracks ordered by `createdAt` descending.
- `/trending`: tracks ordered by `plays` descending.
- `/charts` (Top Charts): a ranked top-20 list with large rank numbers (1 to 20), reusing `TrackRow`.
- `/genres`: a grid of genres (derived from the distinct `genre` values in the database, with a track count), each linking to `/genres/[genre]`, a track list filtered to that genre. Handle URL-encoding of genre names.

Reuse `MusicBrowser`/`TrackRow` where it fits. Add the needed query functions to `src/db/queries.ts` with the same caching approach as the other queries.

**Remove from the navigation for now** (there's no data model for them yet):

- Albums
- The whole "Your Library" group (Liked Songs, Playlists, Downloads)

Don't leave links that 404. Keep the route and icon definitions out of the nav, but leave a short comment in `nav-items.ts` listing them as planned.

**Done when:** every link in desktop nav, sidebar, mobile menu and the mobile tab bar resolves to a real page, and a signed-out visitor can reach all of them.

## Task 2: Fix the navbar layout

Observed problems at desktop width: "All Music", "New Releases" and "Top Charts" wrap onto two lines, and the "Sign in" button wraps ("Sign / in"). On a 402px phone the header shows only "Sign up", so returning users have no way to sign in.

- Add `whitespace-nowrap` to nav items and the auth buttons.
- Make the nav fit gracefully from 768px up. The search field should shrink before the links wrap. If the links still can't fit, show the main five and move the rest under a "More" menu. Verify the layout at 768, 1024 and 1440.
- On mobile, make **both** Sign in and Sign up reachable. Put Sign in in the header next to Sign up if it fits, otherwise put both at the top of the mobile menu. Signed-in users keep the user menu.
- Add a visible focus style (keyboard focus) and `aria-current="page"` on the active link.

**Done when:** no label wraps at any of the four widths, and sign-in is reachable on a phone.

## Task 3: Real cover art support

The schema already has `tracks.coverKey` (and `artists.avatarKey`), but nothing serves them and the UI only shows gradients.

1. Add `GET /api/media/cover/[id]` modelled on `src/app/api/media/audio/[id]/route.ts`. Redirecting to a short-lived signed R2 URL is fine, but set sensible `Cache-Control` so the browser doesn't re-request on every render. Check the Next docs for the right approach.
2. Add `coverUrl?: string` to the shared `Track` type in `src/lib/types.ts`, and set it in the queries and pages that build tracks (only when `coverKey` exists).
3. Create one reusable `<Cover>` component that renders the image when there is a `coverUrl` and falls back to the existing gradient plus a subtle music icon when there isn't. It takes a size/rounded variant. Use `loading="lazy"` and explicit dimensions or aspect-ratio so the layout doesn't jump. Follow the Next docs on whether to use `next/image` with these URLs or a plain `<img>`, and tell me your choice and why.
4. Use `<Cover>` everywhere tracks appear: `TrackRow`, `TrendingNow`, the player bar, the artist page and the new pages from Task 1.
5. Add `scripts/set-cover.ts` that takes a track id and a local image path, uploads the image to R2 under `covers/<trackId>.<ext>`, and sets `cover_key`. Use `dotenv` with `.env.local` like the other scripts, and print what it did but never print credentials. Add an npm script `db:cover`.
6. If it's cheap, do the same for artist avatars with `/api/media/avatar/[id]` and use them on `/artists` and `/artists/[slug]`. If it isn't cheap, skip it and say so.

**Done when:** a track with a `cover_key` shows its image everywhere, one without keeps showing the gradient, and I can attach a cover to a track with one command.

## Task 4: Make the hero feel alive

The hero's right half is an empty gradient on desktop. Fix it.

- On desktop, show a visual built from real data: a cluster or fan of the top 3 to 5 tracks' covers (using `<Cover>`, so gradients work when there is no art) with a play button that starts the top track via the existing player. Slight overlap and rotation is fine.
- On mobile, show a compact version below the text (for example a single featured cover with the play button), not a large empty gradient.
- Keep the headline, copy and the two buttons exactly as they are.
- One subtle entrance animation is enough, and it must respect `prefers-reduced-motion`.
- The Trending Now row on mobile should use scroll-snap, and cards should show the cover, title and artist.
- If the database has no tracks, fall back to a tasteful static composition instead of a blank area.

**Done when:** the hero has no large empty regions at 402 and 1440 pixels and the play button works.

## Task 5: Loading and empty states

- Add skeleton placeholders for the music list, Trending row, artists grid and videos grid, matching the real layouts so nothing jumps. Use `loading.tsx` or `Suspense` boundaries following the Next 16 docs.
- Add friendly empty states with an icon and a one-line message wherever a list can be empty (no tracks in a genre, no artists, no videos).
- Check the spacing between the page content, the player bar and the mobile tab bar (`pb-44 md:pb-28` in the layout). Make sure the last row of content is never hidden behind either bar.

## Task 6 (optional): Fix the two lint errors

`src/components/player/PlayerBar.tsx` and `src/components/player/PlayerProvider.tsx` each have a "setState synchronously within an effect" error. Fix them without changing behaviour (derive the state, use event handlers, or use the documented pattern). Explain each fix in one or two sentences. If a fix risks changing playback behaviour, skip it and tell me instead.

## Final report

Send me:

1. Files changed, per task.
2. Results of `tsc`, `lint` and `build`, and exactly what you couldn't verify.
3. Every default you chose that I might want to override.
4. A manual test checklist I can run in the browser at 402px and 1440px, with each step and its expected result.
5. Anything you noticed but did not change.
