import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** SHA-256 hex digest length (exactly 64 hex characters). */
export const FINGERPRINT_HASH_LENGTH = 64;

export const signatures = sqliteTable(
  "signatures",
  {
    // SHA-256 hex → fixed length; SQLite stores as text(64) affinity hint only.
    fingerprintHash: text("fingerprint_hash", {
      length: FINGERPRINT_HASH_LENGTH,
    }).primaryKey(),
    createdAt: integer("created_at", { mode: "number" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    // text(N) is not enforced at runtime; CHECK is the real length guard.
    check(
      "fingerprint_hash_length",
      sql`length(${table.fingerprintHash}) = ${sql.raw(String(FINGERPRINT_HASH_LENGTH))}`,
    ),
  ],
);

export const signatureStats = sqliteTable("signature_stats", {
  id: integer("id").primaryKey(),
  count: integer("count").notNull().default(0),
});

export type Signature = typeof signatures.$inferSelect;
export type SignatureStats = typeof signatureStats.$inferSelect;
