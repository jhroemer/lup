import styles from "./OverviewPage.module.css";
import type { Screenshot } from "./screenshot.ts";

export function OverviewPage({ screenshots }: { screenshots: Screenshot[] }) {
  return (
    <>
      <h1>All screenshots</h1>
      <div class={styles.cards}>
        {screenshots.map(({ test, comparison }, index) => (
          <a class={styles.card} href={`#/${index}`}>
            <div class={styles.thumbnail}>
              {comparison.kind !== "unrecognized" && (
                <img alt="" src={`data:image/png;base64,${comparison.actual}`} />
              )}
            </div>
            <div class={styles.name}>{comparison.name}</div>
            <div class={styles.details}>
              <span>{test.titlePath.at(-1)}</span>
              {comparison.kind !== "mismatch" && <span>{comparison.kind}</span>}
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
