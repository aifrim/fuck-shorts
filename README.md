# Fuck Shorts

Vertical is fine. People hold phones. The format is not the crime.

Very-short Shorts are. TikToks, Reels, YouTube Shorts — swipe, spike, forget, repeat, until your attention span files for unemployment. That is not entertainment. That is a slot machine with a camera.

YouTube’s “pause” and “time limit” are the same joke in two fonts. One extra tap and the feed is back in your face, unskippable, infinite, stuffing itself down your throat like you asked for it.

This is an open letter to Neal Mohan. Let us **completely disable Shorts**, or at least **kill the endless scroll**. Sign it. Share it. Be so fr.

## How to fuck shorts

Vote. Maybe YouTube’s higher-ups grow a spine. Maybe they don’t. Maybe they have a spine and they just don't care. Either way the count is real and the letter is mean. Let's fuck the signal to noise ration up into the air!

Five voices, same thesis, different cranial firmware. The site will guess yours from browser leftovers (no age quiz — we are not that thirsty). Wrong guess? Tap the toggle. Free will still ships.

## Technical Details

Techstack (the boring part, said quickly)

- [Node](https://nodejs.org/) v22+
- [Astro](https://docs.astro.build/) SSR on [Cloudflare](https://developers.cloudflare.com/workers/) via [@astrojs/cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) — pages, `/api/*`, `/og.png`, hourly cron
- [Solid.js](https://www.solidjs.com/) + [Tailwind CSS](https://tailwindcss.com/)
- [@fingerprintjs/fingerprintjs](https://github.com/fingerprintjs/fingerprintjs)
- [Turso](https://docs.turso.tech/)/[libSQL](https://docs.turso.tech/libsql) + [Drizzle ORM](https://orm.drizzle.team/) (local SQLite file for development)

We hash the fingerprint, park it in Turso, bump a counter atomically. The landing page SSR’s the tally so you do not get a “… ” flash like a coward. Copy lives in `@fuck-shorts/i18n`. The voice guess lives in `@fuck-shorts/generation-heuristic`. Components render. They do not own the attitude.

### Structure

```
fuck-shorts/
├── apps/
│   ├── website          # The petition. Astro SSR, API, OG, cron. One process, one grudge.
│   └── website-e2e      # Playwright smoke. Clicks the beige buttons so you don’t have to.
└── packages/
    ├── i18n             # All the wording. Letters, voices, OG taglines. Components shut up.
    ├── generation-heuristic  # Guesses a voice from UA crumbs. Never asks your age.
    ├── db               # Drizzle + Turso. Hashed fingerprints and a stubborn counter.
    ├── eslint-config    # Shared lint. Includes the no-regex commandment.
    └── prettier-config  # Shared format. Semicolons have been discussed. It is over.
```



### Flow

Countdown until `PUBLIC_PETITION_START`. After that: the tally, the letter, the button. Vote once. We set a single JS-readable `fs_voted` cookie so reload does not pretend you are a virgin signer. `POST /api/vote` rejects until `PETITION_START` (same ISO datetime — keep them identical or enjoy the chaos).

Fingerprint gets hashed, then sent same-origin. We are not collecting your birth year. We are collecting a hash and a grudge.

Hourly cron (`0 * * * *` on Cloudflare) runs `COUNT(votes)` back into `vote_stats`. The public tally and `/og.png` can be a little stale on purpose (`VOTES_CACHE_TTL_SECONDS`). The cron is the adult in the room.

## Local development

Requirements: Node.js 22+, pnpm 11+.

```bash
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm dev
```

Then open [http://localhost:4325](http://localhost:4325). Votes, OG image, and SSR tally all run in that one Astro process. One process. Like an adult.

**Env:** monorepo root `.env` only (copy from `[.env.example](.env.example)`). After changing it, restart `pnpm dev` so Astro re-inlines `PUBLIC_`*. We will not hunt your shell.

The example env uses `PUBLIC_PETITION_START` / `PETITION_START=2026-09-06T00:00:00.000Z` (UTC midnight Sunday 6 Sep 2026, 03:00 in UTC+3) so the countdown is visible and voting stays locked. Set both to a past ISO datetime to poke the CTA. Keep the two values identical. If you don’t, that is on you.


| Service | URL                                            |
| ------- | ---------------------------------------------- |
| Website | [http://localhost:4325](http://localhost:4325) |


Local database file: `.data/local.db` (gitignored). Cloudflare deploy vars live in `apps/website/wrangler.jsonc`. An hourly cron (`0 * * * *`) reconciles `vote_stats.count` from `votes`. `GET /api/votes` and `GET /og.png` use `Cache-Control` / CDN headers (and the Cache API when available). TTL comes from `VOTES_CACHE_TTL_SECONDS` (local `.env` uses `60`; unset defaults to `3600` / 1 hour).

### Scripts


| Command                      | What it does                                     |
| ---------------------------- | ------------------------------------------------ |
| `pnpm dev`                   | Astro SSR website (API + pages)                  |
| `pnpm db:generate`           | Generate Drizzle migrations                      |
| `pnpm db:migrate`            | Apply migrations to local DB                     |
| `pnpm db:studio`             | Open Drizzle Studio on local DB                  |
| `pnpm drizzle-kit studio`    | Same Studio via root `drizzle-kit` binary        |
| `pnpm -r drizzle-kit studio` | Same Studio via `@fuck-shorts/db` package script |
| `pnpm test`                  | Website API + generation-heuristic vitest suites |
| `pnpm e2e`                   | Playwright smoke                                 |
| `pnpm format`                | Format with Prettier                             |
| `pnpm format:check`          | Check Prettier formatting                        |


Drizzle Kit from the repo root uses the root `drizzle-kit` binary and `drizzle.config.ts` (re-exports `packages/db`). Env still comes from the root `.env` / `LIBSQL_DB_URL`.

Deploy / remote Turso wiring comes later. The letter ships first.