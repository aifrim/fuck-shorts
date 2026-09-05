import { createDb, type Database } from "@fuck-shorts/db";

import type { WebsiteEnv } from "./env";

const dbCache = new Map<string, Database>();

/** Cached Drizzle client per URL+token (Workers isolate / Node process). */
export function getDb(env: WebsiteEnv): Database {
  const key = `${env.LIBSQL_DB_URL}::${env.LIBSQL_DB_AUTH_TOKEN ?? ""}`;
  const cached = dbCache.get(key);

  if (cached) return cached;

  const db = createDb({
    url: env.LIBSQL_DB_URL,
    authToken: env.LIBSQL_DB_AUTH_TOKEN,
  });
  dbCache.set(key, db);

  return db;
}
