import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { voteStats } from "./schema.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** Minimal .env loader (no dotenv dep): KEY=VALUE lines, ignore comments/blanks. */
function loadRootEnv(monorepoRoot: string) {
  const envPath = path.join(monorepoRoot, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Don’t clobber vars already set by the shell / process manager.
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

/** Resolve relative `file:` DB paths against the monorepo root. */
function resolveLibsqlUrl(raw: string | undefined, monorepoRoot: string, fallback: string): string {
  const url = raw?.trim() || fallback;
  if (!url.startsWith("file:")) return url;

  const filePath = url.slice("file:".length);
  if (path.isAbsolute(filePath)) return url;

  return `file:${path.resolve(monorepoRoot, filePath)}`;
}

loadRootEnv(root);

const defaultUrl = `file:${path.join(root, ".data", "local.db")}`;
const url = resolveLibsqlUrl(process.env.LIBSQL_DB_URL, root, defaultUrl);

if (url.startsWith("file:")) {
  const filePath = url.slice("file:".length);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

const client = createClient({
  url,
  authToken: process.env.LIBSQL_DB_AUTH_TOKEN,
});

const db = drizzle(client);
const migrationsFolder = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../drizzle",
);

await migrate(db, { migrationsFolder });

await db.insert(voteStats).values({ id: 1, count: 0 }).onConflictDoNothing();

console.log(`Migrated database at ${url}`);
client.close();
