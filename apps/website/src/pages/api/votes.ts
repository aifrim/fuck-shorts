import type { APIRoute } from "astro";

import { getDb } from "../../server/db";
import { websiteEnvFromAstroLocals } from "../../server/env";
import { handleGetVotes } from "../../server/votes";

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const env = await websiteEnvFromAstroLocals(ctx.locals);
  const db = getDb(env);
  const waitUntil = ctx.locals.runtime?.ctx?.waitUntil?.bind(ctx.locals.runtime.ctx);

  return handleGetVotes(ctx.request, env, db, waitUntil);
};
