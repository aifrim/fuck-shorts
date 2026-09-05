import { reconcileSignatureCount } from "@fuck-shorts/db";

import { getDb, hasDb } from "./db";

/** Hourly Cron Trigger — COUNT(signatures) → signature_stats. */
export async function runSignatureReconcile(env: WebsiteEnv): Promise<number> {
  if (!hasDb(env)) {
    console.warn("[cron] D1 DB binding not configured — skip reconcile");
    return 0;
  }

  const db = getDb(env);

  return reconcileSignatureCount(db);
}
