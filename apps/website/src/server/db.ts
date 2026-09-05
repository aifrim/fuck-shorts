import { createDb, type Database } from "@fuck-shorts/db";

const dbCache = new WeakMap<D1Database, Database>();

export type WebsiteEnvWithDb = WebsiteEnv & { DB: D1Database };

/** True when the D1 binding is present. */
export function hasDb(env: WebsiteEnv): env is WebsiteEnvWithDb {
  return Boolean(env.DB);
}

/** Cached Drizzle client per D1 binding (Workers isolate). */
export function getDb(env: WebsiteEnvWithDb): Database {
  const cached = dbCache.get(env.DB);

  if (cached) return cached;

  const db = createDb(env.DB);
  dbCache.set(env.DB, db);

  return db;
}
