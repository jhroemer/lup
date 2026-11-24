import type { FullResult, TestCase, TestResult } from "@playwright/test/reporter";

export type Base64Png = string & { readonly __brand: "Base64Png" };

export type ScreenshotComparison =
  | {
      kind: "mismatch";
      name: string;
      expected: Base64Png;
      actual: Base64Png;
      diff: Base64Png;
    }
  | {
      kind: "missing";
      name: string;
      actual: Base64Png;
    }
  | {
      kind: "unstable";
      name: string;
      previous: Base64Png;
      actual: Base64Png;
      diff: Base64Png;
      expected: Base64Png | null;
    }
  | {
      kind: "unrecognized";
      name: string;
      attachmentNames: string[];
    };

export type Attempt = {
  retry: number;
  status: TestResult["status"];
  comparisons: ScreenshotComparison[];
};

export type TestEntry = {
  id: string;
  title: string;
  describeTitles: string[];
  projectName: string;
  relativeFile: string;
  line: number;
  outcome: ReturnType<TestCase["outcome"]>;
  attempts: Attempt[];
};

export type Report = {
  status: FullResult["status"];
  startTime: string;
  durationMs: number;
  tests: TestEntry[];
};
