import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const FIXTURE_REPORT = path.resolve(import.meta.dirname, "fixture-project/lup-report/index.html");

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
  builder: {},
  environments: {
    client: {
      build: {
        outDir: path.resolve(import.meta.dirname, "dist/ui"),
        emptyOutDir: true,
      },
    },
    reporter: {
      consumer: "server",
      build: {
        outDir: path.resolve(import.meta.dirname, "dist/reporter"),
        emptyOutDir: true,
        rolldownOptions: {
          input: path.resolve(import.meta.dirname, "src/reporter/reporter.ts"),
        },
      },
    },
  },
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
    {
      name: "inline-assets",
      applyToEnvironment: (environment) => environment.name === "client",
      generateBundle: {
        order: "post",
        handler: (_options, bundle) => {
          const html = bundle["index.html"];
          if (html?.type !== "asset") throw new Error("index.html is missing from the bundle");

          html.source = String(html.source)
            .replace(
              /<script type="module" crossorigin src="\/(.+?)"><\/script>/,
              (_match, fileName: string) => {
                const js = bundle[fileName];
                if (js?.type !== "chunk") throw new Error(`${fileName} is not a JS chunk`);
                delete bundle[fileName];
                return `<script type="module">${js.code.replaceAll("</script", "<\\/script")}</script>`;
              },
            )
            .replace(
              /<link rel="stylesheet" crossorigin href="\/(.+?)">/,
              (_match, fileName: string) => {
                const css = bundle[fileName];
                if (css?.type !== "asset") throw new Error(`${fileName} is not a CSS asset`);
                delete bundle[fileName];
                return `<style>${String(css.source)}</style>`;
              },
            );

          const notInlined = Object.keys(bundle).filter((fileName) => fileName !== "index.html");
          if (notInlined.length > 0) {
            throw new Error(`Expected a single index.html, also got ${notInlined.join(", ")}`);
          }
        },
      },
    },
  ],
});
