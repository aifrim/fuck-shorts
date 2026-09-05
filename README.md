# Fuck Shorts

Vertical is fine. People hold phones. The format is not the crime.

Very-short Shorts are. TikToks, Reels, YouTube Shorts — swipe, spike, forget, repeat, until your attention span files for unemployment. That is not entertainment. That is a slot machine with a camera.

YouTube’s “pause” and “time limit” are the same joke in two fonts. One extra tap and the feed is back in your face, unskippable, infinite, stuffing itself down your throat like you asked for it.

This is an open letter to Neal Mohan. Let us **completely disable Shorts**, or at least **kill the endless scroll**. Sign it. Share it. Be so fr.

## How to fuck shorts

Sign. Maybe YouTube’s higher-ups grow a spine. Maybe they don’t. Maybe they have a spine and they just don't care. Either way the count is real and the letter is mean. Let's fuck the signal to noise ration up into the air!

Five voices, same thesis, different cranial firmware. The site will guess yours from browser leftovers (no age quiz — we are not that thirsty). Wrong guess? Tap the toggle. Free will still ships.

## Technical Details

Techstack (the boring part, said quickly)

- [Node](https://nodejs.org/) v22+
- [Astro](https://docs.astro.build/) on [Cloudflare](https://developers.cloudflare.com/workers/) via [@astrojs/cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) — **SSG** landing on Assets/CDN, Worker for `/api/*`, `/og.png`, hourly cron
- [React](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- [@fingerprintjs/fingerprintjs](https://github.com/fingerprintjs/fingerprintjs)
- [Cloudflare D1](https://developers.cloudflare.com/d1/) + [Drizzle ORM](https://orm.drizzle.team/) (local Miniflare D1 in dev; separate preview / production databases)

We hash the fingerprint, park it in D1, bump a counter atomically. The landing page is **SSG** (no Worker on `/`); the island fetches `GET /api/signatures` and shows a skeleton until it lands. Copy lives in `@fuck-shorts/i18n`. The voice guess lives in `@fuck-shorts/generation-heuristic`. Components render. They do not own the attitude.

### Structure

```
fuck-shorts/
├── apps/
│   ├── website          # SSG landing + Worker API/OG/cron. CDN-first, one grudge.
│   └── website-e2e      # Playwright smoke. Clicks the beige buttons so you don’t have to.
└── packages/
    ├── i18n             # All the wording. Letters, voices, OG taglines. Components shut up.
    ├── generation-heuristic  # Guesses a voice from UA crumbs. Never asks your age.
    ├── db               # Drizzle schema + D1 signature helpers.
    ├── tsconfig         # Shared strict TypeScript (@tsconfig/strictest).
    ├── eslint-config    # Shared lint. Includes the no-regex commandment.
    └── prettier-config  # Shared format. Semicolons have been discussed. It is over.
```

### Flow

Countdown until `PUBLIC_PETITION_START` (**baked at `astro build`** — set it in Workers Builds; changing the date needs a new static build). After that: the tally (client fetch + skeleton), the letter, the button. Sign once. We set a single JS-readable `fs_signed` cookie so reload does not pretend you are a virgin signer. `POST /api/sign` rejects until runtime `PETITION_START` (same ISO as `PUBLIC_PETITION_START` — keep them identical or enjoy the chaos).

Fingerprint gets hashed, then sent same-origin. We are not collecting your birth year. We are collecting a hash and a grudge.

Hourly cron (`0 * * * *` on Cloudflare) runs `COUNT(signatures)` back into `signature_stats`. The public tally and `/og.png` can be a little stale on purpose (`SIGNATURES_CACHE_TTL_SECONDS`). The cron is the adult in the room.

## Local development

Requirements: Node.js 22+, pnpm 11+.

```bash
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm dev
```

Then open [http://localhost:4325](http://localhost:4325). SSG landing, signature APIs, and OG image in one Astro/Workers process.

**Env:** monorepo root `.env` for `PUBLIC_*` and optional header Cache-Control overrides (copy from [`.env.example`](.env.example); restart `pnpm dev` / rebuild after changes). `PUBLIC_PETITION_START` is inlined into the SSG page at build time. Worker bindings (`DB`, `PETITION_START`, cache TTL) come from [`apps/website/wrangler.jsonc`](apps/website/wrangler.jsonc) via `platformProxy`. Signature APIs return 503 until the `DB` binding is available.

The example env uses `PUBLIC_PETITION_START=2026-09-06T00:00:00.000Z` (UTC midnight Sunday 6 Sep 2026, 03:00 in UTC+3). Match `PETITION_START` in wrangler vars — if the UI is open and the API still returns 403, those two drifted. Set both to a future ISO datetime to exercise the countdown.

| Service | URL                                            |
| ------- | ---------------------------------------------- |
| Website | [http://localhost:4325](http://localhost:4325) |

### D1 environments

| Env        | Worker                           | Database                                     | Local migrate     | Ship                              |
| ---------- | -------------------------------- | -------------------------------------------- | ----------------- | --------------------------------- |
| local      | top-level wrangler / `astro dev` | Miniflare sqlite for prod D1 id (not remote) | `pnpm db:migrate` | —                                 |
| preview    | `fuck-shorts-website-preview`    | `fuck-shorts-preview`                        | —                 | Workers Builds → `deploy:preview` |
| production | `fuck-shorts-website`            | `fuck-shorts`                                | —                 | Workers Builds → `deploy`         |

Top-level wrangler config is production. Preview uses `CLOUDFLARE_ENV=preview`. Shipping is **only** via Workers Builds on git push — not from a laptop CLI.

#### Migrations (Drizzle generate → Wrangler apply)

- **Generate** SQL with `pnpm db:generate` (`drizzle-kit`; output in [`packages/db/drizzle/`](packages/db/drizzle/)).
- **Apply** with Wrangler only (`migrations_dir` in [`apps/website/wrangler.jsonc`](apps/website/wrangler.jsonc)). Do not use `drizzle-kit migrate` or a custom migrator in the Worker.
- **Local:** `pnpm db:migrate` → `wrangler d1 migrations apply DB --local`.
- **Remote:** applied in CI by the website `deploy` / `deploy:preview` scripts (`wrangler d1 migrations apply DB --remote`, then `wrangler deploy`). Those scripts exist for Workers Builds to call; do not run them from your machine.

**Workers Builds** (push → CI) — configure each Worker project:

| Field          | Production example                                                                                 | Preview example                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Build command  | `CLOUDFLARE_ENV=production pnpm --filter @fuck-shorts/website build` (set `PUBLIC_PETITION_START`) | `CLOUDFLARE_ENV=preview pnpm --filter @fuck-shorts/website build` (set `PUBLIC_PETITION_START`) |
| Deploy command | `pnpm --filter @fuck-shorts/website deploy`                                                        | `pnpm --filter @fuck-shorts/website deploy:preview`                                             |

Do **not** set deploy to bare `wrangler deploy` — pending SQL would never run. Keep build and deploy as separate fields so Astro is not built twice.

**Baselining an existing remote D1:** Wrangler tracks applies in the `d1_migrations` table. If the DB already has the schema (e.g. from an earlier manual/Drizzle apply) but no matching `d1_migrations` rows, the first `migrations apply` will fail with “table already exists”. Fix once before relying on CI: either insert the applied migration filename into `d1_migrations`, or wipe an empty preview DB and let deploy apply cleanly. Fresh databases need no baseline.

Create remote databases once (requires Cloudflare login), then paste each `database_id` into the matching block in [`apps/website/wrangler.jsonc`](apps/website/wrangler.jsonc):

```bash
pnpm exec wrangler d1 create fuck-shorts-preview
pnpm exec wrangler d1 create fuck-shorts
```

An hourly cron reconciles `signature_stats.count` from `signatures`.

#### Caching (CDN-first)

Goal: **minimize Worker usage**. `/` and `/_astro/*` are Assets at the CDN (no `run_worker_first`). The Worker runs for `/api/*`, `/og.png`, and cron only.

| Surface                     | Mechanism                                                                      | TTL / policy                                                                         |
| --------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `/_astro/*`                 | Generated [`public/_headers`](apps/website/public/_headers) via `pnpm headers` | Default `ASTRO_ASSET_CACHE_CONTROL=public, max-age=31536000, immutable`              |
| Landing HTML + other static | Same `_headers` + Assets **ETag**                                              | Default `HTML_CACHE_CONTROL=public, max-age=86400, must-revalidate`                  |
| `GET /api/signatures`       | CDN headers + Worker `caches.default` (credential-free client fetch)           | 1h remote (`SIGNATURES_CACHE_TTL_SECONDS=3600`); 60s local (top-level wrangler vars) |
| `GET /og.png`               | Same as signatures                                                             | 1h                                                                                   |
| `POST /api/sign`            | `Cache-Control: no-store`; sets `fs_signed`                                    | never cached                                                                         |

Override header strings at **build** time with `ASTRO_ASSET_CACHE_CONTROL` / `HTML_CACHE_CONTROL` (see `.env.example`). `public/_headers` is generated and gitignored.

### Scripts

| Command             | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | Astro hybrid (SSG landing + API Worker)           |
| `pnpm db:generate`  | Generate Drizzle SQL migrations                   |
| `pnpm db:migrate`   | Apply migrations to local Miniflare D1 (Wrangler) |
| `pnpm db:studio`    | Open Drizzle Studio on local Miniflare D1         |
| `pnpm test`         | Website API + generation-heuristic vitest suites  |
| `pnpm e2e`          | Playwright smoke                                  |
| `pnpm format`       | Format with Prettier                              |
| `pnpm format:check` | Check Prettier formatting                         |

Drizzle Kit from the repo root uses the root `drizzle-kit` binary and `drizzle.config.ts` (re-exports `packages/db`). See [Migrations](#migrations-drizzle-generate--wrangler-apply) above for generate vs apply.
