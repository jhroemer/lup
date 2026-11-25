import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

const spawnOptions = { cwd: "fixture-project", stdio: "inherit" } as const;

// Creates a fixture report from two runs: one writes baselines, the next fails against them
export function generateFixtureReport() {
  rmSync("fixture-project/tests/__screenshots__", { recursive: true, force: true });

  const baseline = spawnSync("npx", ["playwright", "test", "--update-snapshots=all"], {
    ...spawnOptions,
    env: { ...process.env, FIXTURE_RUN: "baseline" },
  });
  if (baseline.status !== 0) {
    throw new Error(
      `Expected fixture-project baseline run to pass, exited with ${baseline.status}`,
    );
  }

  const compare = spawnSync("npx", ["playwright", "test"], {
    ...spawnOptions,
    env: { ...process.env, FIXTURE_RUN: "compare" },
  });
  if (compare.status !== 1) {
    throw new Error(`Expected fixture-project compare run to fail, exited with ${compare.status}`);
  }
}

if (import.meta.main) generateFixtureReport();
