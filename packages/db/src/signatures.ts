import { count as countRows, eq, sql } from "drizzle-orm";

import type { Database } from "./client";
import { signatureStats, signatures } from "./schema";

export type CastSignatureResult = { status: "created" } | { status: "duplicate" };

export async function getSignatureCount(db: Database): Promise<number> {
  const row = await db.query.signatureStats.findFirst({
    where: eq(signatureStats.id, 1),
  });

  return row?.count ?? 0;
}

/**
 * Authoritative hourly sync: set signature_stats.count to COUNT(*) from signatures.
 * Live signing still updates the counter; this corrects drift between cron runs.
 * Sequential on purpose — D1 rejects SQL BEGIN; batch isn't needed for cron.
 */
export async function reconcileSignatureCount(db: Database): Promise<number> {
  const [result] = await db.select({ value: countRows() }).from(signatures);
  const total = result?.value ?? 0;

  await db.update(signatureStats).set({ count: total }).where(eq(signatureStats.id, 1));

  return total;
}

/**
 * D1 / SQLite wrappers may nest the real constraint error under `.cause`.
 * Walk the chain with a cycle guard so duplicate fingerprints become 409s, not 500s.
 */
function isUniqueConstraintError(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);

    const record = current as {
      message?: string;
      code?: string;
      cause?: unknown;
    };
    const message = record.message ?? "";
    const code = record.code ?? "";

    if (
      code.includes("CONSTRAINT") ||
      code.includes("SQLITE_CONSTRAINT") ||
      message.includes("UNIQUE") ||
      message.includes("unique") ||
      message.includes("PRIMARY KEY") ||
      message.includes("SQLITE_CONSTRAINT")
    ) {
      return true;
    }

    current = record.cause;
  }

  return false;
}

/**
 * Insert + set tally to COUNT(*) via D1 batch (atomic without SQL BEGIN).
 * Public tally stays on GET /api/signatures — this result is status only.
 */
export async function castSignature(
  db: Database,
  fingerprintHash: string,
): Promise<CastSignatureResult> {
  try {
    await db.batch([
      db.insert(signatures).values({ fingerprintHash }),
      // Keep denormalized counter = COUNT(*) (not blind +1 — that drifts).
      db
        .update(signatureStats)
        .set({ count: sql`(select count(*) from ${signatures})` })
        .where(eq(signatureStats.id, 1)),
    ]);

    return { status: "created" };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "duplicate" };
    }

    throw error;
  }
}
