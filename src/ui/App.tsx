import type { Report } from "../types.ts";
import styles from "./App.module.css";
import { OverviewPage } from "./OverviewPage.tsx";
import type { Screenshot } from "./screenshot.ts";
import { ScreenshotPage } from "./ScreenshotPage.tsx";
import { Sidebar } from "./Sidebar.tsx";

export function App({ report }: { report: Report }) {
  const screenshots: Screenshot[] = report.tests.flatMap((test) => {
    const comparisons = test.attempts.at(-1)?.comparisons ?? [];
    return comparisons.map((comparison) => ({ test, comparison }));
  });

  const selectedIndex = location.hash.match(/^#\/(\d+)$/)?.[1];
  const selected = selectedIndex === undefined ? undefined : screenshots[Number(selectedIndex)];

  return (
    <div class={styles.app}>
      <header class={styles.topbar}>
        <a href="#/">lup</a>
      </header>
      <Sidebar screenshots={screenshots} selected={selected} />
      <main class={styles.main}>
        {selected ? (
          <ScreenshotPage screenshot={selected} />
        ) : (
          <OverviewPage screenshots={screenshots} />
        )}
      </main>
    </div>
  );
}
