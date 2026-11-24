import type { Report, ScreenshotComparison, TestEntry } from "../types.ts";

export type Screenshot = {
  index: number;
  test: TestEntry;
  comparison: ScreenshotComparison;
};

export function getReportScreenshots(report: Report): Screenshot[] {
  return report.tests
    .flatMap((test) => {
      const comparisons = test.attempts.at(-1)?.comparisons ?? [];
      return comparisons.map((comparison) => ({ test, comparison }));
    })
    .map(({ test, comparison }, index) => ({ index, test, comparison }));
}
