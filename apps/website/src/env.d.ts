/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface ImportMetaEnv {
  readonly PUBLIC_PETITION_START?: string;
  /** Optional ISO end; unset → signing never closes after open. */
  readonly PUBLIC_PETITION_END?: string;
  readonly PUBLIC_SITE_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Workers Rate Limiting binding — local type so we do not depend on workers-types pin. */
type WebsiteRateLimiter = {
  limit(opts: { key: string }): Promise<{ success: boolean }>;
};

/** Cloudflare Worker bindings (`cloudflare:workers` / wrangler). */
declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    PETITION_START?: string;
    /** Optional ISO end; unset → signing never closes after open. */
    PETITION_END?: string;
    SIGNATURES_CACHE_TTL_SECONDS?: string;
    /** Per-IP POST /api/sign. */
    SIGN_RATE_LIMIT?: WebsiteRateLimiter;
    /** Colo-wide POST /api/sign circuit breaker. */
    SIGN_GLOBAL_RATE_LIMIT?: WebsiteRateLimiter;
    /** Per-IP GET /api/signatures (cache MISS only). */
    SIGNATURES_RATE_LIMIT?: WebsiteRateLimiter;
    /** Per-IP GET /og.png (cache MISS / render only). */
    OG_RATE_LIMIT?: WebsiteRateLimiter;
    /** Colo-wide GET /og.png circuit breaker (cache MISS / render only). */
    OG_GLOBAL_RATE_LIMIT?: WebsiteRateLimiter;
  }
}

/** App-facing alias for Worker bindings. */
type WebsiteEnv = Cloudflare.Env;

declare namespace App {
  interface Locals {
    /** Cloudflare ExecutionContext when available (replaces locals.runtime.ctx). */
    cfContext?: ExecutionContext;
  }
}

/** Cloudflare / Astro binary module (ArrayBuffer of file bytes). */
declare module "*.bin" {
  const data: ArrayBuffer;
  export default data;
}
