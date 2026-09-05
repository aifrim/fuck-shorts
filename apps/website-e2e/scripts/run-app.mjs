import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const websiteRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../website",
);

/** Petition window configs for e2e servers (PUBLIC_* + Worker vars). */
const PHASES = {
  "before-start": {
    PUBLIC_PETITION_START: "2099-01-01T00:00:00.000Z",
    PETITION_START: "2099-01-01T00:00:00.000Z",
  },
  open: {
    PUBLIC_PETITION_START: "2020-01-01T00:00:00.000Z",
    PETITION_START: "2020-01-01T00:00:00.000Z",
    // Pin Worker tally TTL so open e2e cache tests stay fast (not the 60s wrangler default).
    // 15s leaves room to sign a few times and still assert HIT + stale count.
    SIGNATURES_CACHE_TTL_SECONDS: "15",
  },
  ended: {
    PUBLIC_PETITION_START: "2020-01-01T00:00:00.000Z",
    PETITION_START: "2020-01-01T00:00:00.000Z",
    PUBLIC_PETITION_END: "2020-06-01T00:00:00.000Z",
    PETITION_END: "2020-06-01T00:00:00.000Z",
  },
};

/** Stagger parallel Playwright webServers so Vite/Astro boot does not thrash. */
const START_DELAY_MS = {
  "before-start": 0,
  open: 2_500,
  ended: 5_000,
};

function readArg(name) {
  const flag = `--${name}`;
  const index = process.argv.indexOf(flag);

  if (index < 0 || index + 1 >= process.argv.length) return undefined;

  return process.argv[index + 1];
}

const phaseName = readArg("phase");
const port = readArg("port");

if (!phaseName || !(phaseName in PHASES) || !port) {
  console.error("Usage: node run-app.mjs --phase before-start|open|ended --port <port>");
  process.exit(1);
}

const phase = PHASES[phaseName];
const viteCacheDir = path.join(websiteRoot, "node_modules", `.vite-e2e-${phaseName}`);

await delay(START_DELAY_MS[phaseName] ?? 0);

// Skip package `predev` (wrangler wipe). `--ignore-lock` allows parallel phase servers.
// Port is pinned via `E2E_PORT` → astro `server.strictPort` (CLI `--strictPort` is not a flag).
const child = spawn("pnpm", ["exec", "astro", "dev", "--ignore-lock"], {
  cwd: websiteRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    // Let process env override wrangler `vars` when no `.dev.vars` is present.
    CLOUDFLARE_INCLUDE_PROCESS_ENV: "true",
    PUBLIC_SITE_ORIGIN: `http://127.0.0.1:${port}`,
    E2E_PORT: port,
    E2E_VITE_CACHE_DIR: viteCacheDir,
    ...phase,
  },
});

child.on("exit", (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 1);
});
