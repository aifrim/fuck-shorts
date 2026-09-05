import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dbPackageRoot = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dbPackageRoot, "../..");

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

// Relative schema/out: drizzle-kit joins `./` onto paths; absolute `out` breaks generate.
// Run via `pnpm --filter @fuck-shorts/db generate` (cwd = packages/db).
export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: resolveLibsqlUrl(process.env.LIBSQL_DB_URL, root, defaultUrl),
  },
});
