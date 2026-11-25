import type { ScreenshotComparison } from "../types.ts";
import { NewBadge } from "./NewBadge.tsx";
import styles from "./OverviewPage.module.css";
import type { Screenshot } from "./screenshot.ts";
import { type Mode, screenshotUrl } from "./screenshotUrl.ts";

function KindLabel({ kind }: { kind: ScreenshotComparison["kind"] }) {
  switch (kind) {
    case "mismatch":
      return null;
    case "missing":
      return <NewBadge />;
    case "unstable":
    case "unrecognized":
      return <span>{kind}</span>;
    default:
      return kind satisfies never;
  }
}

export function OverviewPage({ screenshots, mode }: { screenshots: Screenshot[]; mode: Mode }) {
  return (
    <>
      <h1>All screenshots</h1>
      <div class={styles.cards}>
        {screenshots.map(({ index, test, comparison }) => (
          <a key={index} class={styles.card} href={screenshotUrl(index, mode)}>
            <div class={styles.thumbnail}>
              {comparison.kind !== "unrecognized" && (
                <img alt="" src={`data:image/png;base64,${comparison.actual}`} />
              )}
            </div>
            <div class={styles.name}>{comparison.name}</div>
            <div class={styles.details}>
              <span>{test.title}</span>
              <KindLabel kind={comparison.kind} />
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
