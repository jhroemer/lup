import { expect, test } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const reportUrl = pathToFileURL(path.resolve("fixture-project/lup-report/index.html")).href;

test("renders failing screenshots", async ({ page }) => {
  await page.goto(reportUrl);
  await expect(page).toHaveScreenshot("report.png");
});

test("renders a single screenshot", async ({ page }) => {
  await page.goto(`${reportUrl}#/0/diff`);
  await expect(page).toHaveScreenshot("screenshot.png");
});
