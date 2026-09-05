import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

import { petitionIsOpen } from "./src/petition-window.ts";

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** PUBLIC_* from monorepo `.env`, overridden by real process env (Workers Builds). */
function loadPublicEnv(root) {
  const fromFile = {};
  const envPath = path.join(root, ".env");

  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) continue;

      const eq = trimmed.indexOf("=");

      if (eq < 0) continue;

      const key = trimmed.slice(0, eq);

      if (!key.startsWith("PUBLIC_")) continue;

      fromFile[key] = trimmed.slice(eq + 1);
    }
  }

  return {
    ...fromFile,
    ...(process.env.PUBLIC_PETITION_START
      ? { PUBLIC_PETITION_START: process.env.PUBLIC_PETITION_START }
      : {}),
    ...(process.env.PUBLIC_PETITION_END
      ? { PUBLIC_PETITION_END: process.env.PUBLIC_PETITION_END }
      : {}),
  };
}

const publicEnv = loadPublicEnv(monorepoRoot);

/** SSG before start / after end; SSR while signing is open. */
function petitionPrerender() {
  return {
    name: "petition-prerender",
    hooks: {
      "astro:route:setup": ({ route }) => {
        if (!route.component.endsWith("pages/index.astro")) return;

        route.prerender = !petitionIsOpen(
          publicEnv.PUBLIC_PETITION_START,
          publicEnv.PUBLIC_PETITION_END,
        );
      },
    },
  };
}

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    // Sharp isn't available in workerd; optimize prerendered images at build time.
    imageService: "compile",
  }),
  // E2E phase servers pin a port and fail if it is taken (no silent hop).
  ...(process.env.E2E_PORT
    ? {
        server: {
          port: Number(process.env.E2E_PORT),
          strictPort: true,
          host: "127.0.0.1",
        },
      }
    : {}),
  // Opt out of sessions entirely — no SESSION KV binding, smaller Worker bundle.
  session: false,
  // include replaces the default filter — cover app + workspace i18n JSX (letters.tsx).
  integrations: [petitionPrerender(), react({ include: ["**/*.{jsx,tsx}"] })],
  vite: {
    envDir: monorepoRoot,
    plugins: [tailwindcss()],
    // Isolate Playwright phase servers so parallel e2e does not clobber one cache.
    ...(process.env.E2E_VITE_CACHE_DIR
      ? { cacheDir: process.env.E2E_VITE_CACHE_DIR }
      : {}),
    // Let Wrangler emit compiled WASM for these packages (do not Vite-bundle them).
    ssr: {
      external: ["@cf-wasm/resvg", "@cf-wasm/satori"],
      // Pre-bundle SSR deps at startup — late discovery re-hashes deps_ssr and
      // crashes workerd with "file does not exist" (Astro + Cloudflare adapter).
      optimizeDeps: {
        include: [
          "@astrojs/react/server.js",
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
          "@fuck-shorts/db",
          "@fuck-shorts/i18n",
          "@fuck-shorts/generation-heuristic",
        ],
      },
    },
  },
});
