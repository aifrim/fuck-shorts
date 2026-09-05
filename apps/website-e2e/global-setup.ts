import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** One-shot fonts / headers / local D1 migrate before phase servers start. */
export default function globalSetup() {
  execSync("pnpm --filter @fuck-shorts/website fonts:og", {
    cwd: repoRoot,
    stdio: "inherit",
  });
  execSync("pnpm --filter @fuck-shorts/website headers", {
    cwd: repoRoot,
    stdio: "inherit",
  });
  execSync("pnpm --filter @fuck-shorts/website db:migrate", {
    cwd: repoRoot,
    stdio: "inherit",
  });
}
