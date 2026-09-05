/**
 * Copy @fontsource WOFF files into src/server/assets as `.bin`
 * so Astro Cloudflare can import them as ArrayBuffers (gitignored).
 */
import { createRequire } from "node:module";
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const assetsDir = join(dirname(fileURLToPath(import.meta.url)), "../src/server/assets");

function fontSourceFile(pkg: string, relativePath: string): string {
  return join(dirname(require.resolve(`${pkg}/package.json`)), relativePath);
}

const fonts: { pkg: string; src: string; dest: string }[] = [
  {
    pkg: "@fontsource/syne",
    src: "files/syne-latin-800-normal.woff",
    dest: "syne-latin-800-normal.bin",
  },
  {
    pkg: "@fontsource/ibm-plex-sans",
    src: "files/ibm-plex-sans-latin-500-normal.woff",
    dest: "ibm-plex-sans-latin-500-normal.bin",
  },
  {
    pkg: "@fontsource/ibm-plex-sans",
    src: "files/ibm-plex-sans-latin-700-normal.woff",
    dest: "ibm-plex-sans-latin-700-normal.bin",
  },
];

await mkdir(assetsDir, { recursive: true });

await Promise.all(
  fonts.map((font) =>
    copyFile(fontSourceFile(font.pkg, font.src), join(assetsDir, font.dest)),
  ),
);

console.log(`OG fonts → ${assetsDir}`);
