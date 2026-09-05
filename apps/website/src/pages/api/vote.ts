import type { APIRoute } from "astro";

import { getDb } from "../../server/db";
import { websiteEnvFromAstroLocals } from "../../server/env";
import { handlePostVote } from "../../server/votes";

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const env = await websiteEnvFromAstroLocals(ctx.locals);
  const db = getDb(env);

  return handlePostVote(ctx.request, env, db);
};
