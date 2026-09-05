import { expect, test } from "@playwright/test";

function isHttpUrl(value: string | undefined): boolean {
  return (
    typeof value === "string" &&
    (value.startsWith("http://") || value.startsWith("https://"))
  );
}

test.describe("Fuck Shorts landing", () => {
  test("shows brand and petition countdown before start", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Fuck Shorts" })).toBeVisible();
    await expect(page.getByText("Petition opens in")).toBeVisible();
    await expect(page.getByRole("timer")).toBeVisible();
    await expect(page.getByText("Hold that hate. Signing starts")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign" })).toHaveCount(0);
    await expect(
      page.getByText("We store one cookie once you sign. Voice pick stays in"),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "local storage" })).toBeVisible();
    await expect(
      page.getByText("The signature count updates every hour."),
    ).toBeVisible();

    const hasShareApi = await page.evaluate(
      () => typeof navigator !== "undefined" && typeof navigator.share === "function",
    );

    await expect(page.getByText("Where do you want to share?")).toBeVisible();
    await expect(page.getByRole("radio", { name: "YouTube" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "X / Twitter" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Instagram / Threads" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Facebook" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "DM / Other" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "LinkedIn" })).toHaveCount(0);
    await expect(page.getByRole("radio", { name: "DM" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Copy share text" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Share this petition" })).toHaveCount(0);

    if (hasShareApi) {
      await expect(page.getByRole("radio", { name: "Share sheet" })).toBeVisible();
    } else {
      await expect(page.getByRole("radio", { name: "Share sheet" })).toHaveCount(0);
    }

    await page.getByRole("radio", { name: "X / Twitter" }).click();
    await expect(page.getByRole("button", { name: "Copy share text" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Share this petition" })).toBeVisible();
    await expect(page.getByText("@YouTube @nealmohan", { exact: true })).toBeVisible();
    await expect(page.getByText("@youtube @neal_mohan", { exact: true })).toHaveCount(0);

    await page.getByRole("radio", { name: "Instagram / Threads" }).click();
    await expect(page.getByText("@youtube @neal_mohan", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy share text" })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Share this petition" })).toHaveCount(1);

    await page.getByRole("radio", { name: "Facebook" }).click();
    await expect(page.getByText("@YouTube", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Share this petition" })).toBeVisible();

    await page.getByRole("radio", { name: "YouTube" }).click();
    await expect(page.getByText("@YouTube @nealmohan", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy share text" })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Share this petition" })).toHaveCount(1);

    await page.getByRole("radio", { name: "DM / Other" }).click();
    await expect(page.getByText("YouTube, Neal Mohan", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy share text" })).toHaveCount(1);

    if (hasShareApi) {
      await page.getByRole("radio", { name: "Share sheet" }).click();
      await expect(page.getByRole("button", { name: "Share this petition" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Copy share text" })).toHaveCount(0);
    }
  });

  test("copies X-tagged share text after picking X / Twitter", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.getByRole("radio", { name: "X / Twitter" }).click();
    await page.getByRole("button", { name: "Copy share text" }).click();
    await expect(page.getByRole("status")).toHaveText("Copied X / Twitter text.");

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("@YouTube @nealmohan");
    expect(copied).toContain("#FuckShorts");
    expect(copied).not.toContain("@neal_mohan");
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
    await page.getByRole("radio", { name: "Share sheet" }).click();
    await expect(page.getByRole("button", { name: "Copy share text" })).toHaveCount(0);
    await page.getByRole("button", { name: "Share this petition" }).click();
    await expect(page.getByRole("status")).toHaveText("Shared. Thanks.");

    const payload = await page.evaluate(() => {
      return (window as unknown as { __lastShare?: ShareData }).__lastShare;
    });

    expect(payload?.title).toBe("Fuck Shorts");
    expect(payload?.text).toContain("@YouTube @nealmohan");
    expect(payload?.text).toContain("#FuckShorts");
    expect(isHttpUrl(payload?.url)).toBe(true);
  });

  test("share next to copy explains when Web Share is missing", async ({ page }) => {
    await page.addInitScript(`
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: undefined,
      });
    `);
    await page.goto("/");
    await page.getByRole("radio", { name: "X / Twitter" }).click();
    await expect(page.getByRole("button", { name: "Copy share text" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Share this petition" })).toBeVisible();
    await page.getByRole("button", { name: "Share this petition" }).click();
    await expect(page.getByRole("status")).toHaveText("Share isn’t available here.");
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
    await page.getByRole("radio", { name: "X / Twitter" }).click();
    await page.getByRole("button", { name: "Share this petition" }).click();
    await expect(page.getByRole("status")).toHaveText("Shared. Thanks.");

    const payload = await page.evaluate(() => {
      return (window as unknown as { __lastShare?: ShareData }).__lastShare;
    });

    expect(payload?.title).toBe("Fuck Shorts");
    expect(payload?.text).toContain("@YouTube @nealmohan");
    expect(payload?.text).toContain("#FuckShorts");
    expect(isHttpUrl(payload?.url)).toBe(true);
  });
});
