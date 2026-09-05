import { count as countRows, eq, sql } from "drizzle-orm";

import type { Database } from "./client.js";
import { voteStats, votes } from "./schema.js";

export type CastVoteResult =
  | { status: "created"; count: number }
  | { status: "duplicate"; count: number };

export async function getVoteCount(db: Database): Promise<number> {
  const row = await db.query.voteStats.findFirst({
    where: eq(voteStats.id, 1),
  });

  return row?.count ?? 0;
}

/**
 * Authoritative hourly sync: set vote_stats.count to COUNT(*) from votes.
 * Live casting still increments; this corrects drift between cron runs.
 */
export async function reconcileVoteCount(db: Database): Promise<number> {
  return db.transaction(async (tx) => {
    const [result] = await tx.select({ value: countRows() }).from(votes);
    const total = result?.value ?? 0;

    await tx
      .update(voteStats)
      .set({ count: total })
      .where(eq(voteStats.id, 1));

    return total;
  });
}

/**
 * LibSQL / better-sqlite wrappers nest the real constraint error under `.cause`.
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

export async function castVote(
  db: Database,
  fingerprintHash: string,
): Promise<CastVoteResult> {
  try {
    const count = await db.transaction(async (tx) => {
      await tx.insert(votes).values({ fingerprintHash });
      await tx
        .update(voteStats)
        .set({ count: sql`${voteStats.count} + 1` })
        .where(eq(voteStats.id, 1));

      const row = await tx.query.voteStats.findFirst({
        where: eq(voteStats.id, 1),
      });

      return row?.count ?? 0;
    });

    return { status: "created", count };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const count = await getVoteCount(db);

      return { status: "duplicate", count };
    }

    throw error;
  }
}
