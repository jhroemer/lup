import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestError,
  TestResult,
} from "@playwright/test/reporter";
import { readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import type { Attempt, Base64Png, Report, ScreenshotComparison } from "../types.ts";

type Attachment = TestResult["attachments"][number];

type AttachmentGroup = { paths: Map<string, string>; attachmentNames: string[] };

const COMPARISON_ATTACHMENT_NAME =
  /^(?<base>.+)-(?<role>expected|actual|diff|previous)(?<extension>\.png)$/;

const BASE64_PNG_SIGNATURE = "iVBORw0KGgo";

const UI_HTML_PATH = resolve(import.meta.dirname, "../ui/index.html");

function isBase64Png(value: string): value is Base64Png {
  return value.startsWith(BASE64_PNG_SIGNATURE);
}

function encodePng(path: string | undefined): Base64Png | null {
  if (!path) return null;
  try {
    const base64 = readFileSync(path).toString("base64");
    return isBase64Png(base64) ? base64 : null;
  } catch {
    return null;
  }
}

function parseScreenshotComparisons(attachments: Attachment[]): ScreenshotComparison[] {
  const groups = new Map<string, AttachmentGroup>();
  for (const attachment of attachments) {
    const match = COMPARISON_ATTACHMENT_NAME.exec(attachment.name);
    if (attachment.contentType !== "image/png" || !attachment.path || !match?.groups) continue;
    // "login-actual.png" -> base: "login", role: "actual", extension: ".png"
    const { base, role, extension } = match.groups;
    const name = `${base}${extension}`;
    const group = groups.get(name) ?? {
      paths: new Map<string, string>(),
      attachmentNames: new Array<string>(),
    };
    group.paths.set(role, attachment.path);
    group.attachmentNames.push(attachment.name);
    groups.set(name, group);
  }
  return [...groups].map(([name, group]) => toScreenshotComparison(name, group));
}

function toScreenshotComparison(
  name: string,
  { paths, attachmentNames }: AttachmentGroup,
): ScreenshotComparison {
  const expected = encodePng(paths.get("expected"));
  const actual = encodePng(paths.get("actual"));
  const diff = encodePng(paths.get("diff"));
  const previous = encodePng(paths.get("previous"));
  if (previous && actual && diff) {
    return { kind: "unstable", name, previous, actual, diff, expected };
  }
  if (expected && actual && diff) {
    return { kind: "mismatch", name, expected, actual, diff };
  }
  // With the default `updateSnapshots: "missing"`, `expected` is attached too, identical to `actual`.
  if (actual && !paths.has("diff")) {
    return { kind: "missing", name, actual };
  }
  return { kind: "unrecognized", name, attachmentNames };
}

function renderHtml(report: Report): string {
  const uiHtml = readFileSync(UI_HTML_PATH, "utf8");
  const bodyEnd = uiHtml.lastIndexOf("</body>");
  if (bodyEnd === -1) throw new Error(`No </body> found in ${UI_HTML_PATH}`);
  const reportJson = JSON.stringify(report).replaceAll("<", "\\u003c");
  return `${uiHtml.slice(0, bodyEnd)}<script type="application/json" id="report">${reportJson}</script>\n${uiHtml.slice(bodyEnd)}`;
}

class ScreenshotReporter implements Reporter {
  private rootDir = "";
  private tests = new Map<string, { test: TestCase; attempts: Attempt[] }>();

  onBegin(config: FullConfig, suite: Suite) {
    this.rootDir = config.rootDir;
    for (const test of suite.allTests()) {
      this.tests.set(test.id, { test, attempts: [] });
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.tests.get(test.id)?.attempts.push({
      retry: result.retry,
      status: result.status,
      comparisons: parseScreenshotComparisons(result.attachments),
    });
  }

  onError(error: TestError) {
    console.error(error.message ?? error.value);
  }

  onEnd(result: FullResult) {
    const report: Report = {
      status: result.status,
      startTime: result.startTime.toISOString(),
      durationMs: result.duration,
      tests: [...this.tests.values()].map(({ test, attempts }) => ({
        id: test.id,
        titlePath: test.titlePath(),
        projectName: test.parent.project()?.name ?? "",
        relativeFile: relative(this.rootDir, test.location.file),
        line: test.location.line,
        outcome: test.outcome(),
        attempts,
      })),
    };
    // TODO: use output path from config
    writeFileSync("screenshot-report.html", renderHtml(report), { encoding: "utf8" });
  }
}

export default ScreenshotReporter;
