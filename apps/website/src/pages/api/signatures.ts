import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

import { getDb, hasDb } from "../../server/db";
import { handleGetSignatures } from "../../server/signatures";

export const prerender = false;

const DB_UNAVAILABLE = JSON.stringify({ error: "Database not configured" });

export const GET: APIRoute = async (ctx) => {
  if (!hasDb(env)) {
    return new Response(DB_UNAVAILABLE, {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = getDb(env);
  const waitUntil = ctx.locals.cfContext?.waitUntil?.bind(ctx.locals.cfContext);

  return handleGetSignatures(ctx.request, env, db, waitUntil);
};
