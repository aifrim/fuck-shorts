import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

import { getDb, hasDb } from "../server/db";
import { handleGetOgPng } from "../server/signatures";
import { resolveSignaturesCacheTtl, cacheHeaders, asResponseBody } from "../server/cache";
import { allowOgRender } from "../server/rate-limit";

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  // Gate every /og.png Worker hit at the route — satori/resvg is the bill.
  const limited = await allowOgRender(env, ctx.request);
  if (limited) return limited;

  const waitUntil = ctx.locals.cfContext?.waitUntil?.bind(ctx.locals.cfContext);

  // No DB → still serve OG with a zero tally so the share card never 500s.
  if (!hasDb(env)) {
    const { renderOgPng } = await import("../server/og");
    const png = await renderOgPng(0);
    const ttl = resolveSignaturesCacheTtl(env.SIGNATURES_CACHE_TTL_SECONDS);

    return new Response(asResponseBody(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        ...cacheHeaders(ttl),
      },
    });
  }

  const db = getDb(env);

  return handleGetOgPng(ctx.request, env, db, waitUntil);
};
