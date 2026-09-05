/** Production default — 60 seconds × 60 minutes = 1 hour. */
export const DEFAULT_SIGNATURES_CACHE_TTL_SECONDS = 3600;

/** Parse env TTL; invalid / unset → 1 hour. */
export function resolveSignaturesCacheTtl(raw: string | undefined): number {
  if (!raw?.trim()) return DEFAULT_SIGNATURES_CACHE_TTL_SECONDS;

  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_SIGNATURES_CACHE_TTL_SECONDS;

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

/** Fresh ArrayBuffer-backed view — TS DOM BodyInit rejects Uint8Array<ArrayBufferLike>. */
export function asResponseBody(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const body = new Uint8Array(bytes.byteLength);
  body.set(bytes);

  return body;
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

    // DOM CacheStorage has no `.default`; Workers types do (lib.dom wins the merge).
    const workerCaches = caches as CacheStorage & { default: Cache };

    return workerCaches.default;
  } catch {
    return null;
  }
}

/** Public tally key — no Cookie so credentialed clients share one entry. */
export function signaturesCacheKey(requestUrl: string): Request {
  const origin = new URL(requestUrl).origin;

  return new Request(`${origin}/api/signatures`, { method: "GET" });
}

/** OG PNG cache key — same TTL policy as /api/signatures. */
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
