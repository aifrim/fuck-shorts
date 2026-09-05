import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Cloudflare / Node env used by SSR + API routes. */
export type WebsiteEnv = {
  LIBSQL_DB_URL: string;
  LIBSQL_DB_AUTH_TOKEN?: string;
  PETITION_START?: string;
  /** GET /api/votes + /og.png cache TTL (local often `60`; prod default 3600). */
  VOTES_CACHE_TTL_SECONDS?: string;
};

const monorepoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

let rootEnvLoaded = false;

/** Values from monorepo `.env` — preferred over wrangler platformProxy for local testing. */
const rootEnvFile: Partial<WebsiteEnv> = {};

const WEBSITE_ENV_KEYS = [
  "LIBSQL_DB_URL",
  "LIBSQL_DB_AUTH_TOKEN",
  "PETITION_START",
  "VOTES_CACHE_TTL_SECONDS",
] as const;

function isWebsiteEnvKey(
  key: string,
): key is (typeof WEBSITE_ENV_KEYS)[number] {
  for (const known of WEBSITE_ENV_KEYS) {
    if (known === key) return true;
  }

  return false;
}

/** Drop undefined so spreads do not clobber earlier layers. */
function definedOnly<T extends Record<string, string | undefined>>(
  partial: T,
): Partial<T> {
  const out: Partial<T> = {};

  for (const key of Object.keys(partial) as (keyof T)[]) {
    const value = partial[key];
    if (value !== undefined) out[key] = value;
  }

  return out;
}

/** Minimal .env loader (no dotenv dep): KEY=VALUE lines for Node / vitest / astro. */
function loadRootEnvOnce() {
  if (rootEnvLoaded) return;
  rootEnvLoaded = true;

  const envPath = path.join(monorepoRoot, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Remember file values even when process.env was pre-filled by wrangler.
    if (isWebsiteEnvKey(key)) rootEnvFile[key] = value;

    if (process.env[key] === undefined) process.env[key] = value;
  }
}

/** Resolve file: DB URLs relative to the monorepo root. */
export function resolveLibsqlUrl(
  raw: string | undefined,
  fallback = `file:${path.join(monorepoRoot, ".data/local.db")}`,
): string {
  const url = raw?.trim() || fallback;
  if (!url.startsWith("file:")) return url;

  const filePath = url.slice("file:".length);
  if (path.isAbsolute(filePath)) return url;

  return `file:${path.resolve(monorepoRoot, filePath)}`;
}

function fromProcessEnv(): Partial<WebsiteEnv> {
  loadRootEnvOnce();

  return {
    LIBSQL_DB_URL: process.env.LIBSQL_DB_URL,
    LIBSQL_DB_AUTH_TOKEN: process.env.LIBSQL_DB_AUTH_TOKEN,
    PETITION_START: process.env.PETITION_START,
    VOTES_CACHE_TTL_SECONDS: process.env.VOTES_CACHE_TTL_SECONDS,
  };
}

/**
 * Merge Cloudflare bindings with process.env / monorepo `.env`.
 * Order: wrangler bindings → process.env → `.env` file (local testing wins).
 */
export function resolveWebsiteEnv(bindings?: Partial<WebsiteEnv> | null): WebsiteEnv {
  const proc = fromProcessEnv();
  const merged = {
    ...(bindings ?? {}),
    ...definedOnly(proc),
    ...definedOnly(rootEnvFile),
  };

  return {
    LIBSQL_DB_URL: resolveLibsqlUrl(merged.LIBSQL_DB_URL),
    LIBSQL_DB_AUTH_TOKEN: merged.LIBSQL_DB_AUTH_TOKEN,
    PETITION_START: merged.PETITION_START,
    VOTES_CACHE_TTL_SECONDS: merged.VOTES_CACHE_TTL_SECONDS,
  };
}

/**
 * Read env for an Astro request.
 * Cloudflare `locals.runtime.env` / platformProxy supply bindings;
 * monorepo `.env` still overrides them for local PETITION_START etc.
 */
export async function websiteEnvFromAstroLocals(
  locals: App.Locals,
): Promise<WebsiteEnv> {
  const runtimeEnv = locals.runtime?.env as Partial<WebsiteEnv> | undefined;
  if (runtimeEnv) return resolveWebsiteEnv(runtimeEnv);

  try {
    const cf = await import("cloudflare:workers");
    const env = (cf as { env?: Partial<WebsiteEnv> }).env;
    if (env) return resolveWebsiteEnv(env);
  } catch {
    // Not running under workerd.
  }

  return resolveWebsiteEnv(null);
}
