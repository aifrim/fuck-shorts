import { signatureStats, signatures } from "@fuck-shorts/db";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getPlatformProxy, type PlatformProxy } from "wrangler";

import {
  handleGetOgPng,
  handleGetSignatures,
  handlePostSign,
} from "../src/server/signatures";
import { getDb, type WebsiteEnvWithDb } from "../src/server/db";
import { allowOgRender, type RateLimiter } from "../src/server/rate-limit";

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let platform: PlatformProxy<WebsiteEnv>;
let baseEnv: WebsiteEnvWithDb;

const hashA = "a".repeat(64);
const hashB = "b".repeat(64);

/** Always-deny limiter for 429 coverage. */
function denyLimiter(): RateLimiter {
  return {
    async limit() {
      return { success: false };
    },
  };
}

function envWith(overrides?: Partial<WebsiteEnv>): WebsiteEnvWithDb {
  return { ...baseEnv, ...overrides, DB: overrides?.DB ?? baseEnv.DB };
}

async function getSignatures(envOverrides?: Partial<WebsiteEnv>, headers?: HeadersInit) {
  const env = envWith(envOverrides);
  const db = getDb(env);
  return handleGetSignatures(
    new Request("http://localhost:4325/api/signatures", { headers }),
    env,
    db,
  );
}

async function postSign(
  body: unknown,
  envOverrides?: Partial<WebsiteEnv>,
  headers?: HeadersInit,
) {
  const env = envWith(envOverrides);
  const db = getDb(env);
  return handlePostSign(
    new Request("http://localhost:4325/api/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
    env,
    db,
  );
}

beforeAll(async () => {
  // Schema from `pretest` → `pnpm db:migrate` (Wrangler local apply).
  platform = await getPlatformProxy<WebsiteEnv>({
    configPath: path.join(websiteRoot, "wrangler.jsonc"),
  });

  if (!platform.env.DB) {
    throw new Error("Expected D1 binding DB from getPlatformProxy");
  }

  baseEnv = {
    DB: platform.env.DB,
    // Past start so signature tests are not blocked by the petition gate.
    PETITION_START: "2020-01-01T00:00:00.000Z",
    SIGNATURES_CACHE_TTL_SECONDS: "3600",
  };
});

afterAll(async () => {
  await platform?.dispose();
});

beforeEach(async () => {
  const db = getDb(baseEnv);
  await db.delete(signatures);
  await db.update(signatureStats).set({ count: 0 });
});

describe("website API handlers", () => {
  it("GET /api/signatures returns count with cache headers", async () => {
    const response = await getSignatures();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ count: 0 });
    expect(response.headers.get("Cache-Control")).toContain("max-age=3600");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
    expect(response.headers.get("CDN-Cache-Control")).toBe("max-age=3600");
    expect(response.headers.get("Cloudflare-CDN-Cache-Control")).toBe("max-age=3600");
    expect(response.headers.get("Timing-Allow-Origin")).toBe("*");
    expect(response.headers.get("X-Worker-Cache")).toBe("MISS");
  });

  it("POST /api/sign rejects invalid hashes", async () => {
    const response = await postSign({ fingerprintHash: "nope" });
    expect(response.status).toBe(400);
  });

  it("POST /api/sign increments counter and sets cookies", async () => {
    const response = await postSign({ fingerprintHash: hashA });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });

    const cookies =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : [response.headers.get("set-cookie") ?? ""];
    expect(cookies.some((value) => value.includes("fs_signed=1"))).toBe(true);
    expect(cookies.some((value) => value.includes("HttpOnly"))).toBe(false);
    expect(cookies.some((value) => value.includes("fs_signed_ui"))).toBe(false);

    const signaturesResponse = await getSignatures();
    expect(await signaturesResponse.json()).toEqual({ count: 1 });
  });

  it("POST /api/sign rejects when PETITION_START is unset", async () => {
    const response = await postSign(
      { fingerprintHash: hashA },
      { PETITION_START: undefined },
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "Signing has not been announced yet",
    });
  });

  it("POST /api/sign rejects signatures before PETITION_START", async () => {
    const response = await postSign(
      { fingerprintHash: hashA },
      { PETITION_START: "2099-01-01T00:00:00.000Z" },
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "Signing has not opened yet",
    });

    const signaturesResponse = await getSignatures();
    expect(await signaturesResponse.json()).toEqual({ count: 0 });
  });

  it("POST /api/sign rejects signatures after PETITION_END", async () => {
    const response = await postSign(
      { fingerprintHash: hashA },
      {
        PETITION_START: "2020-01-01T00:00:00.000Z",
        PETITION_END: "2020-06-01T00:00:00.000Z",
      },
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "Signing has ended",
    });

    const signaturesResponse = await getSignatures();
    expect(await signaturesResponse.json()).toEqual({ count: 0 });
  });

  it("POST /api/sign is idempotent per fingerprint", async () => {
    await postSign({ fingerprintHash: hashA });
    const duplicate = await postSign({ fingerprintHash: hashA });
    expect(duplicate.status).toBe(409);
    expect(await duplicate.json()).toEqual({ alreadySigned: true });

    await postSign({ fingerprintHash: hashB });
    const signaturesResponse = await getSignatures();
    expect(await signaturesResponse.json()).toEqual({ count: 2 });
  });

  it("GET /og.png returns a PNG with the same cache TTL as signatures", async () => {
    const env = envWith();
    const db = getDb(env);
    const response = await handleGetOgPng(
      new Request("http://localhost:4325/og.png"),
      env,
      db,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toContain("max-age=3600");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
    expect(response.headers.get("X-Worker-Cache")).toBe("MISS");

    const bytes = new Uint8Array(await response.arrayBuffer());
    expect([...bytes.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  });

  it("POST /api/sign returns 429 when per-IP rate limit is exceeded", async () => {
    const response = await postSign(
      { fingerprintHash: hashA },
      { SIGN_RATE_LIMIT: denyLimiter() },
      { "CF-Connecting-IP": "203.0.113.10" },
    );
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "Too many requests" });
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    const signaturesResponse = await getSignatures();
    expect(await signaturesResponse.json()).toEqual({ count: 0 });
  });

  it("POST /api/sign returns 429 when global rate limit is exceeded", async () => {
    const response = await postSign(
      { fingerprintHash: hashA },
      { SIGN_GLOBAL_RATE_LIMIT: denyLimiter() },
      { "CF-Connecting-IP": "203.0.113.11" },
    );
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "Too many requests" });
    expect(response.headers.get("Retry-After")).toBe("10");
  });

  it("GET /api/signatures returns 429 when rate limit is exceeded on MISS", async () => {
    const response = await getSignatures(
      { SIGNATURES_RATE_LIMIT: denyLimiter() },
      { "CF-Connecting-IP": "203.0.113.12" },
    );
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "Too many requests" });
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("GET /og.png returns 429 when per-IP rate limit is exceeded", async () => {
    const env = envWith({ OG_RATE_LIMIT: denyLimiter() });
    const response = await allowOgRender(
      env,
      new Request("http://localhost:4325/og.png", {
        headers: { "CF-Connecting-IP": "203.0.113.13" },
      }),
    );
    expect(response).not.toBeNull();
    expect(response!.status).toBe(429);
    expect(await response!.json()).toEqual({ error: "Too many requests" });
    expect(response!.headers.get("Retry-After")).toBe("60");
  });

  it("GET /og.png returns 429 when global rate limit is exceeded", async () => {
    const env = envWith({ OG_GLOBAL_RATE_LIMIT: denyLimiter() });
    const response = await allowOgRender(
      env,
      new Request("http://localhost:4325/og.png", {
        headers: { "CF-Connecting-IP": "203.0.113.14" },
      }),
    );
    expect(response).not.toBeNull();
    expect(response!.status).toBe(429);
    expect(await response!.json()).toEqual({ error: "Too many requests" });
    expect(response!.headers.get("Retry-After")).toBe("10");
  });
});
