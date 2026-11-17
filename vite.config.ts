import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const FIXTURE_REPORT = path.resolve(import.meta.dirname, "fixture-project/screenshot-report.html");

function readFixtureReportJson(): string {
  if (!existsSync(FIXTURE_REPORT)) {
    throw new Error(
      `${FIXTURE_REPORT} is missing, run "npm run generate-fixture-report" to generate it`,
    );
  }
  const html = readFileSync(FIXTURE_REPORT, "utf8");
  const json = /<script type="application\/json" id="report">(.*?)<\/script>/s.exec(html)?.[1];
  if (!json) throw new Error(`No report data found in ${FIXTURE_REPORT}`);
  return json;
}

export default defineConfig({
  root: "src/ui",
  plugins: [
    {
      name: "inject-fixture-report",
      apply: "serve",
      transformIndexHtml: () => [
        {
          tag: "script",
          attrs: { type: "application/json", id: "report" },
          children: readFixtureReportJson(),
          injectTo: "body-prepend",
        },
      ],
    },
  ],
});
