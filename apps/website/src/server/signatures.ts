import {
  castSignature,
  FINGERPRINT_HASH_LENGTH,
  getSignatureCount,
  type Database,
} from "@fuck-shorts/db";

import {
  asResponseBody,
  cacheHeaders,
  decorateCacheHit,
  getWorkerCache,
  ogCacheKey,
  resolveSignaturesCacheTtl,
  signaturesCacheKey,
  type WaitUntil,
} from "./cache";
import { signedCookieHeader } from "./cookies";
import { allowRequest, clientKey, rateLimitResponse } from "./rate-limit";

/**
 * Empty / invalid PETITION_START means signing has not been announced.
 * Otherwise true once the start instant has passed.
 */
export function signingHasOpened(startIso: string | undefined): boolean {
  if (!startIso?.trim()) return false;

  const start = Date.parse(startIso);
  if (Number.isNaN(start)) return false;

  return Date.now() >= start;
}

/** True when PETITION_START is a usable ISO datetime. */
export function petitionStartIsSet(startIso: string | undefined): boolean {
  if (!startIso?.trim()) return false;

  return !Number.isNaN(Date.parse(startIso));
}

/**
 * Optional PETITION_END: unset / invalid → never ends.
 * True once the end instant has passed (signing closed).
 */
export function signingHasEnded(endIso: string | undefined): boolean {
  if (!endIso?.trim()) return false;

  const end = Date.parse(endIso);
  if (Number.isNaN(end)) return false;

  return Date.now() >= end;
}

/** SHA-256 hex digest: fixed hex digit count (no regex — project rule). */
export function isSha256Hex(value: string): boolean {
  if (value.length !== FINGERPRINT_HASH_LENGTH) return false;

  for (const ch of value) {
    const c = ch.toLowerCase();
    const isDigit = c >= "0" && c <= "9";
    const isHexLetter = c >= "a" && c <= "f";

    if (!isDigit && !isHexLetter) return false;
  }

  return true;
}

/** Prefer warm /api/signatures Cache API entry so OG and JSON stay on one tally. */
export async function resolveSignatureCountForOg(
  requestUrl: string,
  db: Database,
  workerCache: Cache | null,
): Promise<number> {
  if (workerCache) {
    const hit = await workerCache.match(signaturesCacheKey(requestUrl));

    if (hit) {
      try {
        const data = (await hit.clone().json()) as { count?: unknown };
        if (typeof data.count === "number" && Number.isFinite(data.count)) {
          return Math.floor(data.count);
        }
      } catch {
        // Fall through to D1 if the cached body is unusable.
      }
    }
  }

  return getSignatureCount(db);
}

export async function handleGetSignatures(
  request: Request,
  env: WebsiteEnv,
  db: Database,
  waitUntil?: WaitUntil,
): Promise<Response> {
  const cacheKey = signaturesCacheKey(request.url);
  const workerCache = getWorkerCache();

  if (workerCache) {
    const hit = await workerCache.match(cacheKey);

    if (hit) return decorateCacheHit(hit);
  }

  // Rate-limit D1 misses only — cached HITs stay cheap.
  if (!(await allowRequest(env.SIGNATURES_RATE_LIMIT, clientKey(request)))) {
    return rateLimitResponse(60);
  }

  const count = await getSignatureCount(db);
  const ttl = resolveSignaturesCacheTtl(env.SIGNATURES_CACHE_TTL_SECONDS);
  const headers = {
    "Content-Type": "application/json",
    ...cacheHeaders(ttl),
    "X-Worker-Cache": "MISS",
  };
  const response = new Response(JSON.stringify({ count }), {
    status: 200,
    headers,
  });

  if (workerCache && waitUntil) {
    waitUntil(workerCache.put(cacheKey, response.clone()));
  }

  return response;
}

export async function handlePostSign(
  request: Request,
  env: WebsiteEnv,
  db: Database,
): Promise<Response> {
  // Cap D1 writes before parsing the body — cheapest rejection path.
  const ip = clientKey(request);

  if (!(await allowRequest(env.SIGN_RATE_LIMIT, ip))) {
    return rateLimitResponse(60);
  }

  if (!(await allowRequest(env.SIGN_GLOBAL_RATE_LIMIT, "sign"))) {
    return rateLimitResponse(10);
  }

  // 403 — outside the signing window (unannounced / not started / ended).
  if (!petitionStartIsSet(env.PETITION_START)) {
    return Response.json(
      { error: "Signing has not been announced yet" },
      { status: 403 },
    );
  }

  if (!signingHasOpened(env.PETITION_START)) {
    return Response.json({ error: "Signing has not opened yet" }, { status: 403 });
  }

  if (signingHasEnded(env.PETITION_END)) {
    return Response.json({ error: "Signing has ended" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw =
    typeof body === "object" &&
    body !== null &&
    "fingerprintHash" in body &&
    typeof (body as { fingerprintHash: unknown }).fingerprintHash === "string"
      ? (body as { fingerprintHash: string }).fingerprintHash.trim().toLowerCase()
      : null;

  if (!raw || !isSha256Hex(raw)) {
    return Response.json(
      { error: "fingerprintHash must be a SHA-256 hex string" },
      { status: 400 },
    );
  }

  const result = await castSignature(db, raw);
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });

  headers.append("Set-Cookie", signedCookieHeader(request.url));

  // 201 — first signature; 409 — same fingerprint again. Tally is GET /api/signatures only.
  if (result.status === "created") {
    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers,
    });
  }

  return new Response(JSON.stringify({ alreadySigned: true }), {
    status: 409,
    headers,
  });
}

export async function handleGetOgPng(
  request: Request,
  env: WebsiteEnv,
  db: Database,
  waitUntil?: WaitUntil,
): Promise<Response> {
  const cacheKey = ogCacheKey(request.url);
  const workerCache = getWorkerCache();

  if (workerCache) {
    const hit = await workerCache.match(cacheKey);

    if (hit) return decorateCacheHit(hit);
  }

  // Rate limit lives in pages/og.png.ts (route edge) so every Worker hit is gated.
  const { renderOgPng } = await import("./og");
  const count = await resolveSignatureCountForOg(request.url, db, workerCache);
  const png = await renderOgPng(count);
  const ttl = resolveSignaturesCacheTtl(env.SIGNATURES_CACHE_TTL_SECONDS);
  const headers = {
    "Content-Type": "image/png",
    ...cacheHeaders(ttl),
    "X-Worker-Cache": "MISS",
  };
  const response = new Response(asResponseBody(png), { status: 200, headers });

  if (workerCache && waitUntil) {
    waitUntil(workerCache.put(cacheKey, response.clone()));
  }

  return response;
}
