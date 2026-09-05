import { expect, test } from "@playwright/test";

import { copyXShareText, useGenericVoice } from "./e2e-helpers";

test.describe("Can I sign?", () => {
  test("no — petition has not started", async ({ page }) => {
    await useGenericVoice(page);
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Fuck Shorts" })).toBeVisible();
    await expect(page.getByText("Petition opens in")).toBeVisible();
    await expect(page.getByRole("timer")).toBeVisible();
    await expect(page.getByText("Signing starts")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign" })).toHaveCount(0);
  });
});

test.describe("Share copy by phase", () => {
  test("before start — pre-open pitch", async ({ page }) => {
    const copied = await copyXShareText(page);
    expect(copied).toContain("Signing isn’t open yet");
    expect(copied).not.toContain("Let us completely disable Shorts");
    expect(copied).not.toContain("Signing is closed — we showed up");
  });
});
