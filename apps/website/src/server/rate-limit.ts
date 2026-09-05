/**
 * Workers Rate Limiting helpers.
 * Fail-open when the binding is missing or limit() throws — never brick signing / OG.
 */

/** Minimal shape so we do not depend on RateLimit being in workers-types. */
export type RateLimiter = {
  limit(opts: { key: string }): Promise<{ success: boolean }>;
};

/** CF-Connecting-IP, or "local" when absent (Miniflare / vitest). */
export function clientKey(request: Request): string {
  const ip = request.headers.get("CF-Connecting-IP")?.trim();

  return ip && ip.length > 0 ? ip : "local";
}

/** True when the request is allowed (or the limiter is unavailable). */
export async function allowRequest(
  limiter: RateLimiter | undefined,
  key: string,
): Promise<boolean> {
  if (!limiter) return true;

  try {
    const { success } = await limiter.limit({ key });

    return success;
  } catch {
    // Limiter glitch — prefer availability over a hard outage.
    return true;
  }
}

/**
 * Per-IP then colo-wide gate for GET /og.png (route edge in pages/og.png.ts).
 */
export async function allowOgRender(
  env: WebsiteEnv,
  request: Request,
): Promise<Response | null> {
  if (!(await allowRequest(env.OG_RATE_LIMIT, clientKey(request)))) {
    return rateLimitResponse(60);
  }

  if (!(await allowRequest(env.OG_GLOBAL_RATE_LIMIT, "og"))) {
    return rateLimitResponse(10);
  }

  return null;
}

/** 429 JSON matching the rest of the API error shape. */
export function rateLimitResponse(retryAfterSeconds: number): Response {
  return new Response(JSON.stringify({ error: "Too many requests" }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Retry-After": String(retryAfterSeconds),
    },
  });
}
