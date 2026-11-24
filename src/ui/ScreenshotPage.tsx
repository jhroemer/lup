import type { Base64Png, ScreenshotComparison } from "../types.ts";
import type { Screenshot } from "./screenshot.ts";
import styles from "./ScreenshotPage.module.css";

function labelledImages(comparison: ScreenshotComparison): [label: string, png: Base64Png][] {
  switch (comparison.kind) {
    case "mismatch":
      return [
        ["expected", comparison.expected],
        ["actual", comparison.actual],
        ["diff", comparison.diff],
      ];
    case "missing":
      return [["actual", comparison.actual]];
    case "unstable": {
      const images: [label: string, png: Base64Png][] = [
        ["previous", comparison.previous],
        ["actual", comparison.actual],
        ["diff", comparison.diff],
      ];
      if (comparison.expected) images.unshift(["expected", comparison.expected]);
      return images;
    }
    case "unrecognized":
      return [];
    default:
      return comparison satisfies never;
  }
}

export function ScreenshotPage({ screenshot: { test, comparison } }: { screenshot: Screenshot }) {
  return (
    <>
      <h1>{comparison.name}</h1>
      <p class={styles.details}>
        <span>{test.titlePath.at(-1)}</span>
        <code>
          {test.relativeFile}:{test.line}
        </code>
        <span>{test.projectName}</span>
        {comparison.kind !== "mismatch" && <span>{comparison.kind}</span>}
      </p>
      {comparison.kind === "unrecognized" && (
        <p>Unrecognized attachments: {comparison.attachmentNames.join(", ")}</p>
      )}
      <div class={styles.images}>
        {labelledImages(comparison).map(([label, png]) => (
          <figure>
            <figcaption>{label}</figcaption>
            <img alt={`${comparison.name} ${label}`} src={`data:image/png;base64,${png}`} />
          </figure>
        ))}
      </div>
    </>
  );
}
