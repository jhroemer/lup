import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

const spawnOptions = { cwd: "fixture-project", stdio: "inherit" } as const;

// Creates a fixture report by writing baselines, and then running tests again with a diff to provoke failures
export function generateFixtureReport() {
  rmSync("fixture-project/tests/__screenshots__", { recursive: true, force: true });

  // Generate baseline screenshots
  const baseline = spawnSync("npx", ["playwright", "test", "--update-snapshots=all"], spawnOptions);
  if (baseline.status !== 0) {
    throw new Error(
      `Expected fixture-project baseline run to pass, exited with ${baseline.status}`,
    );
  }

  // Run again with a diff, to provoke failures
  const mismatch = spawnSync("npx", ["playwright", "test"], {
    ...spawnOptions,
    env: { ...process.env, FIXTURE_VARIANT: "changed" },
  });
  if (mismatch.status !== 1) {
    throw new Error(`Expected fixture-project to fail, exited with ${mismatch.status}`);
  }
}

if (import.meta.main) generateFixtureReport();
