/**
 * Custom Cloudflare Worker entry (wrangler `main`).
 * Delegates HTTP to Astro; adds the hourly signature reconcile cron.
 */
import { handle } from "@astrojs/cloudflare/handler";

import { runSignatureReconcile } from "./server/cron";

export default {
  async fetch(request, env, ctx) {
    return handle(request, env, ctx);
  },

  async scheduled(_controller, env) {
    await runSignatureReconcile(env);
  },
} satisfies ExportedHandler<Cloudflare.Env>;
