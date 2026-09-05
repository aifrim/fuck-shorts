import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

/** Mirror Astro Cloudflare `.bin` → ArrayBuffer imports for Node vitest. */
function binAsArrayBuffer() {
  return {
    name: "bin-as-arraybuffer",
    enforce: "pre" as const,
    load(id: string) {
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
