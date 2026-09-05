import { expect, test } from "@playwright/test";

import { isHttpUrl, pickShareDestination, useGenericVoice } from "./e2e-helpers";

/** Share UI mechanics — open project (signing-open pitch). */
test.describe("Share sheet", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await useGenericVoice(page);
    await page.goto("/");
    await expect(page.getByRole("radio", { name: "GENERIC" })).toBeChecked();
  });

  test("copies X-tagged open share text after picking X / Twitter", async ({ page }) => {
    await pickShareDestination(page, "X / Twitter");

    const copy = page.getByRole("button", { name: "Copy share text" });
    await expect(copy).toBeVisible();
    await copy.click();
    await expect(
      page.getByRole("region", { name: "Share this petition" }).getByRole("status"),
    ).toHaveText("Copied X / Twitter text.");

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("@YouTube @nealmohan");
    expect(copied).toContain("#FuckShorts");
    expect(copied).toContain("Let us completely disable Shorts");
    expect(copied).not.toContain("@neal_mohan");
    expect(copied).not.toContain("Signing isn’t open yet");
    expect(copied).not.toContain("Signing is closed — we showed up");
  });

  test("share sheet destination uses the Web Share API", async ({ page }) => {
    await page.addInitScript(`
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async (data) => {
          window.__lastShare = data;
        },
      });
    `);
    await page.goto("/");
    await expect(page.getByRole("radio", { name: "GENERIC" })).toBeChecked();
    await pickShareDestination(page, "Share sheet");
    await expect(page.getByRole("button", { name: "Copy share text" })).toHaveCount(0);
    await page.getByRole("button", { name: "Share this petition" }).click();
    await expect(
      page.getByRole("region", { name: "Share this petition" }).getByRole("status"),
    ).toHaveText("Shared. Thanks.");

    const payload = await page.evaluate(() => {
      return (window as unknown as { __lastShare?: ShareData }).__lastShare;
    });

    expect(payload?.title).toBe("Fuck Shorts");
    expect(payload?.text).toContain("@YouTube @nealmohan");
    expect(payload?.text).toContain("#FuckShorts");
    expect(payload?.text).toContain("Let us completely disable Shorts");
    expect(isHttpUrl(payload?.url)).toBe(true);
  });

  test("hides share next to copy when Web Share is missing", async ({ page }) => {
    await page.addInitScript(`
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: undefined,
      });
    `);
    await page.goto("/");
    await expect(page.getByRole("radio", { name: "GENERIC" })).toBeChecked();
    await pickShareDestination(page, "X / Twitter");
    await expect(page.getByRole("button", { name: "Copy share text" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Share this petition" })).toHaveCount(
      0,
    );
  });

  test("share next to copy sends platform-specific Web Share payload", async ({
    page,
  }) => {
    await page.addInitScript(`
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async (data) => {
          window.__lastShare = data;
        },
      });
    `);
    await page.goto("/");
    await expect(page.getByRole("radio", { name: "GENERIC" })).toBeChecked();
    await pickShareDestination(page, "X / Twitter");
    await page.getByRole("button", { name: "Share this petition" }).click();
    await expect(
      page.getByRole("region", { name: "Share this petition" }).getByRole("status"),
    ).toHaveText("Shared. Thanks.");

    const payload = await page.evaluate(() => {
      return (window as unknown as { __lastShare?: ShareData }).__lastShare;
    });

    expect(payload?.title).toBe("Fuck Shorts");
    expect(payload?.text).toContain("@YouTube @nealmohan");
    expect(payload?.text).toContain("#FuckShorts");
    expect(payload?.text).toContain("Let us completely disable Shorts");
    expect(isHttpUrl(payload?.url)).toBe(true);
  });
});
