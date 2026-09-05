import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    // Load wrangler vars / bindings in `astro dev` (LIBSQL_*, PETITION_START, …).
    platformProxy: {
      enabled: true,
      configPath: "./wrangler.jsonc",
    },
    workerEntryPoint: {
      path: "src/worker.ts",
    },
  }),
  // include replaces the default filter — cover app + workspace i18n JSX (letters.tsx).
  integrations: [solidJs({ include: ["**/*.{jsx,tsx}"] })],
  vite: {
    envDir: monorepoRoot,
    plugins: [tailwindcss()],
    // Let Wrangler emit compiled WASM for these packages (do not Vite-bundle them).
    ssr: {
      external: ["@cf-wasm/resvg", "@cf-wasm/satori"],
    },
  },
});
