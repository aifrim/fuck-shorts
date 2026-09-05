import {
  expect,
  type APIRequestContext,
  type Browser,
  type Page,
} from "@playwright/test";

/** Stable generic voice so CTA / thanks copy does not depend on the heuristic. */
export async function useGenericVoice(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("fuck-shorts:voice", "generic");
  });
}

export function isHttpUrl(value: string | undefined): boolean {
  return (
    typeof value === "string" &&
    (value.startsWith("http://") || value.startsWith("https://"))
  );
}

/** Chip click can no-op under parallel Vite load; retry until aria-checked sticks. */
export async function pickShareDestination(page: Page, name: string) {
  const radio = page.getByRole("radio", { name });

  await expect(async () => {
    await radio.click();
    await expect(radio).toBeChecked({ timeout: 500 });
  }).toPass();
}

/** Copy X / Twitter share body (generic voice). Returns clipboard text. */
export async function copyXShareText(page: Page): Promise<string> {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await useGenericVoice(page);
  await page.goto("/");
  await expect(page.getByRole("radio", { name: "GENERIC" })).toBeChecked();
  await pickShareDestination(page, "X / Twitter");

  const copy = page.getByRole("button", { name: "Copy share text" });
  await expect(copy).toBeVisible();
  await copy.click();
  // Scope to share region — SignPanel also uses `role="status"` when ended.
  await expect(
    page.getByRole("region", { name: "Share this petition" }).getByRole("status"),
  ).toHaveText("Copied X / Twitter text.");

  return page.evaluate(() => navigator.clipboard.readText());
}

export type SignaturesPayload = { count: number };

/** Local open e2e Worker tally TTL — keep in sync with `run-app.mjs` open phase. */
export const SIGNATURES_CACHE_TTL_MS = 15_000;

/** Public tally GET — used to assert Worker cache HIT/MISS + stale counts. */
export async function fetchSignatures(request: APIRequestContext): Promise<{
  status: number;
  cache: string | undefined;
  count: number;
}> {
  const response = await request.get("/api/signatures");
  const body = (await response.json()) as SignaturesPayload;

  return {
    status: response.status(),
    cache: response.headers()["x-worker-cache"],
    count: body.count,
  };
}

/**
 * Distinct UAs so each Playwright context posts a different fingerprint.
 * (Headless Chromium entropy is sticky; we bind the hash to the request UA.)
 */
export const SIGNER_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0",
] as const;

/** One-off UA so parallel open-phase tests do not share a fingerprint on local D1. */
export function uniqueSignerUserAgent(label: string): string {
  const nonce = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `Mozilla/5.0 (Compatible; FuckShortsE2E/${label}/${nonce}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36`;
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Replace FingerprintJS’s sticky headless hash with sha256(User-Agent).
 * E2e fools the fingerprint via the context UA Playwright already sets.
 */
export async function bindSignHashToUserAgent(page: Page): Promise<void> {
  await page.route("**/api/sign", async (route) => {
    const request = route.request();

    if (request.method() !== "POST") {
      await route.continue();
      return;
    }

    const userAgent = request.headers()["user-agent"] ?? "";
    const fingerprintHash = await sha256Hex(userAgent);

    await route.continue({
      postData: JSON.stringify({ fingerprintHash }),
      headers: {
        ...request.headers(),
        "content-type": "application/json",
      },
    });
  });
}

/** Open petition, click Sign, wait for thanks — one browser context / fingerprint. */
export async function signAsUserAgent(
  browser: Browser,
  userAgent: string,
  baseURL: string,
): Promise<void> {
  const context = await browser.newContext({
    baseURL,
    userAgent,
  });
  const page = await context.newPage();

  try {
    await bindSignHashToUserAgent(page);
    await useGenericVoice(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Sign" }).click();
    await expect(page.getByText("And you!")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign" })).toHaveCount(0);
  } finally {
    await context.close();
  }
}
