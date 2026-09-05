import { expect, test } from "@playwright/test";

import {
  bindSignHashToUserAgent,
  fetchSignatures,
  sha256Hex,
  SIGNATURES_CACHE_TTL_MS,
  SIGNER_USER_AGENTS,
  signAsUserAgent,
  uniqueSignerUserAgent,
  useGenericVoice,
} from "./e2e-helpers";

test.describe("Can I sign?", () => {
  test("yes — petition has started", async ({ browser, baseURL }) => {
    expect(baseURL).toBeTruthy();
    await signAsUserAgent(browser, uniqueSignerUserAgent("can-sign-yes"), baseURL!);
  });

  test("no — already signed, signing again", async ({ browser, baseURL }) => {
    expect(baseURL).toBeTruthy();

    const userAgent = uniqueSignerUserAgent("can-sign-again");
    const context = await browser.newContext({
      baseURL: baseURL!,
      userAgent,
    });
    const page = await context.newPage();

    try {
      await bindSignHashToUserAgent(page);
      await useGenericVoice(page);
      await page.goto("/");

      await page.getByRole("button", { name: "Sign" }).click();
      await expect(page.getByText("And you!")).toBeVisible();

      // Drop the UI cookie so the CTA returns; same UA-derived fingerprint still hits 409.
      await context.clearCookies();
      await page.reload();

      const sign = page.getByRole("button", { name: "Sign" });
      await expect(sign).toBeVisible();
      await sign.click();
      await expect(page.getByText("And you!")).toBeVisible();
      await expect(page.getByRole("button", { name: "Sign" })).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});

test.describe("Signatures cache + many signers", () => {
  test("GET /api/signatures warms Worker cache then serves HIT", async ({ request }) => {
    const first = await fetchSignatures(request);
    expect(first.status).toBe(200);
    expect(first.cache === "MISS" || first.cache === "HIT").toBe(true);

    // waitUntil(put) may finish slightly after the MISS response.
    await expect
      .poll(async () => (await fetchSignatures(request)).cache, {
        timeout: 10_000,
      })
      .toBe("HIT");

    const hit = await fetchSignatures(request);
    expect(hit.count).toBe(first.count);
  });

  test("cached tally stays stale after a new signature", async ({
    browser,
    request,
    baseURL,
  }) => {
    expect(baseURL).toBeTruthy();

    await expect
      .poll(async () => (await fetchSignatures(request)).cache, {
        timeout: 10_000,
      })
      .toBe("HIT");

    const before = await fetchSignatures(request);
    expect(before.cache).toBe("HIT");

    await signAsUserAgent(browser, uniqueSignerUserAgent("cache-stale"), baseURL!);

    // While TTL is live, every HIT must still serve the pre-sign count.
    for (let probe = 0; probe < 3; probe += 1) {
      const stale = await fetchSignatures(request);
      expect(stale.cache).toBe("HIT");
      expect(stale.count).toBe(before.count);
      if (probe < 2) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }
  });

  test("distinct user agents each create a signature", async ({ browser, baseURL }) => {
    expect(baseURL).toBeTruthy();

    // Nonce so hashes stay unique across persistent local D1 + parallel workers.
    const runId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const statuses: number[] = [];
    const userAgents = SIGNER_USER_AGENTS.map(
      (base, index) => `${base} FuckShortsE2E/${runId}/${index}`,
    );

    for (const userAgent of userAgents) {
      const context = await browser.newContext({
        baseURL: baseURL!,
        userAgent,
      });
      const page = await context.newPage();

      try {
        await bindSignHashToUserAgent(page);
        await useGenericVoice(page);
        await page.goto("/");
        await expect(page.evaluate(() => navigator.userAgent)).resolves.toBe(userAgent);

        const signResponse = page.waitForResponse((response) => {
          if (response.request().method() !== "POST") return false;
          return response.url().includes("/api/sign");
        });

        await page.getByRole("button", { name: "Sign" }).click();
        const response = await signResponse;
        statuses.push(response.status());

        await expect(page.getByText("And you!")).toBeVisible();
      } finally {
        await context.close();
      }
    }

    expect(statuses).toEqual([201, 201, 201]);

    const expectedHashes = await Promise.all(userAgents.map((ua) => sha256Hex(ua)));
    expect(new Set(expectedHashes).size).toBe(userAgents.length);

    // Same UA again → same derived hash → 409.
    {
      const context = await browser.newContext({
        baseURL: baseURL!,
        userAgent: userAgents[0]!,
      });
      const page = await context.newPage();

      try {
        await bindSignHashToUserAgent(page);
        await useGenericVoice(page);
        await page.goto("/");

        const signResponse = page.waitForResponse((response) => {
          if (response.request().method() !== "POST") return false;
          return response.url().includes("/api/sign");
        });

        await page.getByRole("button", { name: "Sign" }).click();
        expect((await signResponse).status()).toBe(409);
        await expect(page.getByText("And you!")).toBeVisible();
      } finally {
        await context.close();
      }
    }
  });

  test("tally catches up by +3 after signatures cache TTL", async ({
    browser,
    request,
    baseURL,
  }) => {
    // Warm cache → 3 signs → still stale → wait TTL → D1 count includes +3.
    test.setTimeout(SIGNATURES_CACHE_TTL_MS + 45_000);
    expect(baseURL).toBeTruthy();

    await expect
      .poll(async () => (await fetchSignatures(request)).cache, {
        timeout: 10_000,
      })
      .toBe("HIT");

    const before = await fetchSignatures(request);
    expect(before.cache).toBe("HIT");

    const runId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    for (let index = 0; index < 3; index += 1) {
      await signAsUserAgent(
        browser,
        uniqueSignerUserAgent(`cache-ttl-${runId}-${index}`),
        baseURL!,
      );
    }

    // Cache still active: HIT + unchanged (old) count across a few probes.
    for (let probe = 0; probe < 3; probe += 1) {
      const stale = await fetchSignatures(request);
      expect(stale.cache).toBe("HIT");
      expect(stale.count).toBe(before.count);
      if (probe < 2) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }

    // Open e2e server pins SIGNATURES_CACHE_TTL_SECONDS=15.
    await new Promise((resolve) => setTimeout(resolve, SIGNATURES_CACHE_TTL_MS + 2_000));

    const fresh = await fetchSignatures(request);
    // +3 from this test; parallel open tests may add more during the wait.
    expect(fresh.count).toBeGreaterThanOrEqual(before.count + 3);
  });
});
