import { expect, test } from "@playwright/test";

const isBaselineRun = process.env.FIXTURE_RUN === "baseline";
const htmlUrl = new URL("../index.html", import.meta.url).href;

test("mismatch", async ({ page }) => {
  await page.goto(htmlUrl);
  // Change the page, to force a diff against the baseline
  if (!isBaselineRun) {
    await page.locator("body").evaluate((body) => (body.textContent = "hello changed world"));
  }
  await expect(page).toHaveScreenshot("mismatch.png");

  // take screenshots in both light and dark mode
  // one screenshot per feature
});

test("new", async ({ page }) => {
  test.skip(isBaselineRun, "Gets no baseline, so the compare run reports it as new");
  await page.goto(htmlUrl);
  await expect(page).toHaveScreenshot("new.png");
});

// TODO:
// 1. cover a snapshot that is not failing
