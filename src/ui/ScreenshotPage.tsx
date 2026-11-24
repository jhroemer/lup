import { useEffect } from "preact/hooks";
import type { Base64Png, ScreenshotComparison } from "../types.ts";
import type { Screenshot } from "./screenshot.ts";
import styles from "./ScreenshotPage.module.css";
import { type Mode, screenshotUrl } from "./screenshotUrl.ts";

function comparisonImages(comparison: ScreenshotComparison): { mode: Mode; png: Base64Png }[] {
  switch (comparison.kind) {
    case "mismatch":
      return [
        { mode: "expected", png: comparison.expected },
        { mode: "actual", png: comparison.actual },
        { mode: "diff", png: comparison.diff },
      ];
    case "missing":
      return [{ mode: "actual", png: comparison.actual }];
    case "unstable":
      return [
        ...(comparison.expected ? [{ mode: "expected" as const, png: comparison.expected }] : []),
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
      if (!image) return;
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

  const currentImage = images.find((image) => image.mode === mode) ?? {
    mode: "actual",
    png: comparison.actual,
  };

  return (
    <div class={styles.page}>
      <header>
        <h1>{comparison.name}</h1>
        <div class={styles.modes}>
          {images.map((image, position) => (
            <a
              key={image.mode}
              href={screenshotUrl(index, image.mode)}
              aria-current={image.mode === currentImage.mode ? "true" : undefined}
              aria-keyshortcuts={String(position + 1)}
            >
              {image.mode} <kbd>{position + 1}</kbd>
            </a>
          ))}
        </div>
      </header>
      <p class={styles.details}>
        <code>{path}</code>
        {comparison.kind !== "mismatch" && <span>{comparison.kind}</span>}
      </p>
      <div class={styles.image}>
        <img
          alt={`${comparison.name} ${currentImage.mode}`}
          src={`data:image/png;base64,${currentImage.png}`}
        />
      </div>
    </div>
  );
}
