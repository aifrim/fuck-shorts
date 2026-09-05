import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const isCi = Boolean(process.env["CI"]);
const skipWebServer = Boolean(process.env["PLAYWRIGHT_SKIP_WEBSERVER"]);
const e2eRoot = path.dirname(fileURLToPath(import.meta.url));
const runApp = path.join(e2eRoot, "scripts/run-app.mjs");

const phases = [
  { name: "before-start", port: 4735 },
  { name: "open", port: 4736 },
  { name: "ended", port: 4737 },
] as const;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  globalSetup: "./global-setup.ts",
  use: {
    ...devices["Desktop Chrome"],
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "before-start",
      use: { baseURL: `http://127.0.0.1:${phases[0].port}` },
      testMatch: ["landing.before-start.spec.ts"],
    },
    {
      name: "open",
      use: { baseURL: `http://127.0.0.1:${phases[1].port}` },
      testMatch: ["landing.open.spec.ts", "share-sheet.spec.ts"],
    },
    {
      name: "ended",
      use: { baseURL: `http://127.0.0.1:${phases[2].port}` },
      testMatch: ["landing.ended.spec.ts"],
    },
  ],
  // Omit webServer under exactOptionalPropertyTypes — do not pass `undefined`.
  ...(skipWebServer
    ? {}
    : {
        webServer: phases.map((phase) => ({
          command: `node ${runApp} --phase ${phase.name} --port ${phase.port}`,
          url: `http://127.0.0.1:${phase.port}`,
          reuseExistingServer: false,
          timeout: 180_000,
        })),
      }),
});
