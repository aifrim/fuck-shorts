import { reconcileVoteCount } from "@fuck-shorts/db";

import { getDb } from "./db";
import { resolveWebsiteEnv, type WebsiteEnv } from "./env";

/** Hourly Cron Trigger — COUNT(votes) → vote_stats. */
export async function runVoteReconcile(
  bindings?: Partial<WebsiteEnv> | null,
): Promise<number> {
  const env = resolveWebsiteEnv(bindings);
  const db = getDb(env);

  return reconcileVoteCount(db);
}
