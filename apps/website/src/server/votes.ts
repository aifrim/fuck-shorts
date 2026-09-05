import {
  castVote,
  FINGERPRINT_HASH_LENGTH,
  getVoteCount,
  type Database,
} from "@fuck-shorts/db";

import {
  cacheHeaders,
  decorateCacheHit,
  getWorkerCache,
  ogCacheKey,
  resolveVotesCacheTtl,
  votesCacheKey,
  type WaitUntil,
} from "./cache";
import { votedCookieHeader } from "./cookies";
import type { WebsiteEnv } from "./env";

/** Empty / invalid PETITION_START means voting is open immediately. */
export function votingHasOpened(startIso: string | undefined): boolean {
  if (!startIso) return true;

  const start = Date.parse(startIso);
  if (Number.isNaN(start)) return true;

  return Date.now() >= start;
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

/** Prefer warm /api/votes Cache API entry so OG and JSON stay on one tally. */
export async function resolveVoteCountForOg(
  requestUrl: string,
  db: Database,
  workerCache: Cache | null,
): Promise<number> {
  if (workerCache) {
    const hit = await workerCache.match(votesCacheKey(requestUrl));

    if (hit) {
      try {
        const data = (await hit.clone().json()) as { count?: unknown };
        if (typeof data.count === "number" && Number.isFinite(data.count)) {
          return Math.floor(data.count);
        }
      } catch {
        // Fall through to libSQL if the cached body is unusable.
      }
    }
  }

  return getVoteCount(db);
}

export async function handleGetVotes(
  request: Request,
  env: WebsiteEnv,
  db: Database,
  waitUntil?: WaitUntil,
): Promise<Response> {
  const cacheKey = votesCacheKey(request.url);
  const workerCache = getWorkerCache();

  if (workerCache) {
    const hit = await workerCache.match(cacheKey);

    if (hit) return decorateCacheHit(hit);
  }

  const count = await getVoteCount(db);
  const ttl = resolveVotesCacheTtl(env.VOTES_CACHE_TTL_SECONDS);
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

export async function handlePostVote(
  request: Request,
  env: WebsiteEnv,
  db: Database,
): Promise<Response> {
  if (!votingHasOpened(env.PETITION_START)) {
    return Response.json({ error: "Voting has not opened yet" }, { status: 403 });
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

  const result = await castVote(db, raw);
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });

  headers.append("Set-Cookie", votedCookieHeader(request.url));

  if (result.status === "created") {
    return new Response(JSON.stringify({ count: result.count }), {
      status: 201,
      headers,
    });
  }

  return new Response(
    JSON.stringify({ count: result.count, alreadyVoted: true }),
    { status: 409, headers },
  );
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

  const { renderOgPng } = await import("./og");
  const count = await resolveVoteCountForOg(request.url, db, workerCache);
  const png = await renderOgPng(count);
  const ttl = resolveVotesCacheTtl(env.VOTES_CACHE_TTL_SECONDS);
  const headers = {
    "Content-Type": "image/png",
    ...cacheHeaders(ttl),
    "X-Worker-Cache": "MISS",
  };
  const response = new Response(png, { status: 200, headers });

  if (workerCache && waitUntil) {
    waitUntil(workerCache.put(cacheKey, response.clone()));
  }

  return response;
}
