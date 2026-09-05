import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";

/** Mirror Astro Cloudflare `.bin` → ArrayBuffer imports for Node vitest. */
function binAsArrayBuffer(): Plugin {
  return {
    name: "bin-as-arraybuffer",
    enforce: "pre",
    load(id) {
      if (!id.endsWith(".bin")) return null;

      const bytes = readFileSync(id);
      const b64 = bytes.toString("base64");

      return `const bytes = Uint8Array.from(atob(${JSON.stringify(b64)}), (c) => c.charCodeAt(0));
export default bytes.buffer;`;
    },
  };
}

export default defineConfig({
  plugins: [binAsArrayBuffer()],
  test: {
    environment: "node",
    fileParallelism: false,
    include: ["tests/**/*.test.ts"],
  },
});
