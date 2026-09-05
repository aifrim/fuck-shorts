/**
 * Custom Cloudflare Worker entry for Astro (`workerEntryPoint`).
 * Wraps the default Astro fetch handler and adds the hourly reconcile cron.
 */
import type { SSRManifest } from "astro";
import { createExports as createAstroExports } from "@astrojs/cloudflare/entrypoints/server.js";

import { runVoteReconcile } from "./server/cron";
import type { WebsiteEnv } from "./server/env";

export function createExports(manifest: SSRManifest) {
  const { default: astroWorker } = createAstroExports(manifest);

  return {
    default: {
      fetch: astroWorker.fetch,

      async scheduled(
        _controller: ScheduledController,
        env: WebsiteEnv,
      ): Promise<void> {
        await runVoteReconcile(env);
      },
    },
  };
}
