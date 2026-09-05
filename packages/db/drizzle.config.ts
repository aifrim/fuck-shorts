import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const website = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../apps/website",
);

/** Local Miniflare D1 for Studio — see drizzle-orm#1545. */
function localD1SqliteUrl(): string | undefined {
  if (!process.argv.includes("studio")) return undefined;

  // Only under D1 — other Miniflare stores also keep *.sqlite files.
  const d1Dir = path.join(website, ".wrangler/state/v3/d1/miniflare-D1DatabaseObject");

  if (!fs.existsSync(d1Dir)) {
    throw new Error(`Local D1 missing under ${d1Dir}. Run \`pnpm db:migrate\` first.`);
  }

  const file = fs
    .readdirSync(d1Dir, { encoding: "utf8" })
    .find((name) => name.endsWith(".sqlite") && name !== "metadata.sqlite");

  if (!file) {
    throw new Error(`Local D1 missing under ${d1Dir}. Run \`pnpm db:migrate\` first.`);
  }

  return path.join(d1Dir, file);
}

const url = localD1SqliteUrl();

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  ...(url ? { dbCredentials: { url } } : {}),
});
