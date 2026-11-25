import { useEffect } from "preact/hooks";
import type { Base64Png, ScreenshotComparison } from "../types.ts";
import { NewBadge } from "./NewBadge.tsx";
import type { Screenshot } from "./screenshot.ts";
import styles from "./ScreenshotPage.module.css";
import { type Mode, screenshotUrl } from "./screenshotUrl.ts";

const NO_BASELINE_TOOLTIP_ID = "no-baseline";

function comparisonImages(
  comparison: ScreenshotComparison,
): { mode: Mode; png: Base64Png | undefined }[] {
  switch (comparison.kind) {
    case "mismatch":
      return [
        { mode: "expected", png: comparison.expected },
        { mode: "actual", png: comparison.actual },
        { mode: "diff", png: comparison.diff },
      ];
    case "missing":
      return [
        { mode: "expected", png: undefined },
        { mode: "actual", png: comparison.actual },
        { mode: "diff", png: undefined },
      ];
    case "unstable":
      return [
        { mode: "expected", png: comparison.expected ?? undefined },
        { mode: "previous", png: comparison.previous },
        { mode: "actual", png: comparison.actual },
        { mode: "diff", png: comparison.diff },
      ];
    case "unrecognized":
      return [];
    default:
      return comparison satisfies never;
  }
}

export function ScreenshotPage({
  screenshot: { index, test, comparison },
  mode,
}: {
  screenshot: Screenshot;
  mode: Mode;
}) {
  const path = [
    test.projectName,
    `${test.relativeFile}:${test.line}`,
    ...test.describeTitles,
    test.title,
  ]
    .filter(Boolean)
    .join(" › ");

  const images = comparisonImages(comparison);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const image = images[Number(event.key) - 1];
      if (!image?.png) return;
      event.preventDefault();
      location.replace(screenshotUrl(index, image.mode));
    };
    addEventListener("keydown", onKeyDown);
    return () => removeEventListener("keydown", onKeyDown);
  });

  if (comparison.kind === "unrecognized") {
    return (
      <div class={styles.page}>
        <h1>{comparison.name}</h1>
        <p class={styles.details}>
          <code>{path}</code>
        </p>
        <p>Unrecognized attachments: {comparison.attachmentNames.join(", ")}</p>
      </div>
    );
  }

  const requestedImage = images.find((image) => image.mode === mode);
  const currentMode = requestedImage?.png ? requestedImage.mode : "actual";
  const currentPng = requestedImage?.png ?? comparison.actual;

  return (
    <div class={styles.page}>
      <header>
        <div class={styles.title}>
          <h1>{comparison.name}</h1>
          {comparison.kind === "missing" && (
            <button
              type="button"
              popovertarget={NO_BASELINE_TOOLTIP_ID}
              aria-describedby={NO_BASELINE_TOOLTIP_ID}
            >
              <NewBadge />
            </button>
          )}
        </div>
        <div class={styles.modes}>
          {images.map((image, position) =>
            image.png ? (
              <a
                key={image.mode}
                href={screenshotUrl(index, image.mode)}
                aria-current={image.mode === currentMode ? "true" : undefined}
                aria-keyshortcuts={String(position + 1)}
              >
                {image.mode} <kbd>{position + 1}</kbd>
              </a>
            ) : (
              <button
                key={image.mode}
                type="button"
                aria-disabled="true"
                popovertarget={NO_BASELINE_TOOLTIP_ID}
                aria-describedby={NO_BASELINE_TOOLTIP_ID}
              >
                {image.mode} <kbd>{position + 1}</kbd>
              </button>
            ),
          )}
        </div>
        {images.some((image) => !image.png) && (
          <div id={NO_BASELINE_TOOLTIP_ID} class={styles.tooltip} popover="hint" role="tooltip">
            No baseline exists for this screenshot yet.
          </div>
        )}
      </header>
      <p class={styles.details}>
        <code>{path}</code>
        {comparison.kind === "unstable" && <span>unstable</span>}
      </p>
      <div class={styles.image}>
        <img
          alt={`${comparison.name} ${currentMode}`}
          src={`data:image/png;base64,${currentPng}`}
        />
      </div>
    </div>
  );
}
