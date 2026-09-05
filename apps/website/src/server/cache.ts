/** Production default — 60 seconds × 60 minutes = 1 hour. */
export const DEFAULT_VOTES_CACHE_TTL_SECONDS = 3600;

/** Parse env TTL; invalid / unset → 1 hour. */
export function resolveVotesCacheTtl(raw: string | undefined): number {
  if (!raw?.trim()) return DEFAULT_VOTES_CACHE_TTL_SECONDS;

  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_VOTES_CACHE_TTL_SECONDS;

  return Math.floor(n);
}

export function cacheHeaders(ttlSeconds: number): Record<string, string> {
  const ttl = String(ttlSeconds);

  return {
    "Cache-Control": `public, max-age=${ttl}, s-maxage=${ttl}`,
    "CDN-Cache-Control": `max-age=${ttl}`,
    "Cloudflare-CDN-Cache-Control": `max-age=${ttl}`,
    "Timing-Allow-Origin": "*",
  };
}

/** Age seconds since Date, when a cache serves a stored response. */
export function ageSecondsFromDate(dateHeader: string | null): string | null {
  if (!dateHeader) return null;

  const then = Date.parse(dateHeader);
  if (Number.isNaN(then)) return null;

  return String(Math.max(0, Math.floor((Date.now() - then) / 1000)));
}

/** Cloudflare Cache API; absent in Node / vitest. */
export function getWorkerCache(): Cache | null {
  try {
    if (typeof caches === "undefined") return null;

    return caches.default;
  } catch {
    return null;
  }
}

/** Public tally key — no Cookie so credentialed clients share one entry. */
export function votesCacheKey(requestUrl: string): Request {
  const origin = new URL(requestUrl).origin;

  return new Request(`${origin}/api/votes`, { method: "GET" });
}

/** OG PNG cache key — same TTL policy as /api/votes. */
export function ogCacheKey(requestUrl: string): Request {
  const origin = new URL(requestUrl).origin;

  return new Request(`${origin}/og.png`, { method: "GET" });
}

export type WaitUntil = (promise: Promise<unknown>) => void;

/** Apply HIT markers + Age onto a cached Response. */
export function decorateCacheHit(hit: Response): Response {
  const headers = new Headers(hit.headers);
  headers.set("X-Worker-Cache", "HIT");
  headers.set("Timing-Allow-Origin", "*");

  const age = ageSecondsFromDate(headers.get("Date"));
  if (age !== null) headers.set("Age", age);

  return new Response(hit.body, {
    status: hit.status,
    statusText: hit.statusText,
    headers,
  });
}
