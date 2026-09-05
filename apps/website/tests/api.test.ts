import { createDb, voteStats, votes } from "@fuck-shorts/db";
import { migrate } from "drizzle-orm/libsql/migrator";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  handleGetOgPng,
  handleGetVotes,
  handlePostVote,
} from "../src/server/votes";
import { resolveLibsqlUrl, type WebsiteEnv } from "../src/server/env";
import { getDb } from "../src/server/db";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const dbPath = path.join(root, ".data", "website-test.db");
const dbUrl = `file:${dbPath}`;
const migrationsFolder = path.join(root, "packages/db/drizzle");

const baseEnv: WebsiteEnv = {
  LIBSQL_DB_URL: resolveLibsqlUrl(dbUrl),
  PETITION_START: undefined,
  VOTES_CACHE_TTL_SECONDS: "3600",
};

const hashA = "a".repeat(64);
const hashB = "b".repeat(64);

function envWith(overrides?: Partial<WebsiteEnv>): WebsiteEnv {
  return { ...baseEnv, ...overrides };
}

async function getVotes(envOverrides?: Partial<WebsiteEnv>) {
  const env = envWith(envOverrides);
  const db = getDb(env);
  return handleGetVotes(
    new Request("http://localhost:4325/api/votes"),
    env,
    db,
  );
}

async function postVote(
  body: unknown,
  envOverrides?: Partial<WebsiteEnv>,
) {
  const env = envWith(envOverrides);
  const db = getDb(env);
  return handlePostVote(
    new Request("http://localhost:4325/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    env,
    db,
  );
}

beforeAll(async () => {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  for (const suffix of ["", "-wal", "-shm"]) {
    const file = `${dbPath}${suffix}`;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  const db = createDb({ url: dbUrl });
  await migrate(db, { migrationsFolder });
  await db.insert(voteStats).values({ id: 1, count: 0 }).onConflictDoNothing();
});

beforeEach(async () => {
  const db = createDb({ url: dbUrl });
  await db.delete(votes);
  await db.update(voteStats).set({ count: 0 });
});

describe("website API handlers", () => {
  it("GET /api/votes returns count with cache headers", async () => {
    const response = await getVotes();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ count: 0 });
    expect(response.headers.get("Cache-Control")).toContain("max-age=3600");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
    expect(response.headers.get("CDN-Cache-Control")).toBe("max-age=3600");
    expect(response.headers.get("Cloudflare-CDN-Cache-Control")).toBe(
      "max-age=3600",
    );
    expect(response.headers.get("Timing-Allow-Origin")).toBe("*");
    expect(response.headers.get("X-Worker-Cache")).toBe("MISS");
  });

  it("POST /api/vote rejects invalid hashes", async () => {
    const response = await postVote({ fingerprintHash: "nope" });
    expect(response.status).toBe(400);
  });

  it("POST /api/vote increments counter and sets cookies", async () => {
    const response = await postVote({ fingerprintHash: hashA });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ count: 1 });

    const cookies =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : [response.headers.get("set-cookie") ?? ""];
    expect(cookies.some((value) => value.includes("fs_voted=1"))).toBe(true);
    expect(cookies.some((value) => value.includes("HttpOnly"))).toBe(false);
    expect(cookies.some((value) => value.includes("fs_voted_ui"))).toBe(false);

    const votesResponse = await getVotes();
    expect(await votesResponse.json()).toEqual({ count: 1 });
  });

  it("POST /api/vote rejects votes before PETITION_START", async () => {
    const response = await postVote(
      { fingerprintHash: hashA },
      { PETITION_START: "2099-01-01T00:00:00.000Z" },
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "Voting has not opened yet",
    });

    const votesResponse = await getVotes();
    expect(await votesResponse.json()).toEqual({ count: 0 });
  });

  it("POST /api/vote is idempotent per fingerprint", async () => {
    await postVote({ fingerprintHash: hashA });
    const duplicate = await postVote({ fingerprintHash: hashA });
    expect(duplicate.status).toBe(409);
    expect(await duplicate.json()).toEqual({ count: 1, alreadyVoted: true });

    await postVote({ fingerprintHash: hashB });
    const votesResponse = await getVotes();
    expect(await votesResponse.json()).toEqual({ count: 2 });
  });

  it("GET /og.png returns a PNG with the same cache TTL as votes", async () => {
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
});
