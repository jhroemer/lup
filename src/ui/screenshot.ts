import type { ScreenshotComparison, TestEntry } from "../types.ts";

export type Screenshot = {
  test: TestEntry;
  comparison: ScreenshotComparison;
};
