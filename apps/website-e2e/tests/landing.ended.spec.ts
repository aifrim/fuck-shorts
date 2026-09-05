import { expect, test } from "@playwright/test";

import { copyXShareText, useGenericVoice } from "./e2e-helpers";

test.describe("Can I sign?", () => {
  test("no — petition has ended", async ({ page }) => {
    await useGenericVoice(page);
    await page.goto("/");

    await expect(
      page.getByText("Signing is closed. Thanks for being here."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign" })).toHaveCount(0);
  });
});

test.describe("Share copy by phase", () => {
  test("ended — post-close pitch", async ({ page }) => {
    const copied = await copyXShareText(page);
    expect(copied).toContain("Signing is closed — we showed up");
    expect(copied).not.toContain("Signing isn’t open yet");
    expect(copied).not.toContain("Let us completely disable Shorts");
  });
});
