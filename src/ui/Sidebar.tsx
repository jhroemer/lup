import { useEffect } from "preact/hooks";
import type { Screenshot } from "./screenshot.ts";
import { type Mode, screenshotUrl } from "./screenshotUrl.ts";
import styles from "./Sidebar.module.css";

export function Sidebar({
  screenshots,
  selected,
  mode,
}: {
  screenshots: Screenshot[];
  selected: Screenshot | undefined;
  mode: Mode;
}) {
  const tests = [...new Set(screenshots.map((screenshot) => screenshot.test))];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const urls = ["#/", ...screenshots.map(({ index }) => screenshotUrl(index, mode))];
      const position = selected ? selected.index + 1 : 0;
      const next = urls[position + (event.key === "ArrowDown" ? 1 : -1)];
      if (!next) return;
      event.preventDefault();
      location.replace(next);
    };
    addEventListener("keydown", onKeyDown);
    return () => removeEventListener("keydown", onKeyDown);
  });

  return (
    <nav class={styles.sidebar}>
      <ul>
        <li>
          <a class={styles.overview} href="#/" aria-current={selected ? undefined : "page"}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
              <rect x="1" y="1" width="6" height="6" rx="1.5" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" />
            </svg>
            All screenshots
          </a>
        </li>
        {tests.map((test) => (
          <li key={test.id}>
            <span>{test.title}</span>
            <ul>
              {screenshots
                .filter((screenshot) => screenshot.test === test)
                .map((screenshot) => (
                  <li key={screenshot.index}>
                    <a
                      href={screenshotUrl(screenshot.index, mode)}
                      aria-current={screenshot === selected ? "page" : undefined}
                      ref={
                        screenshot === selected
                          ? (link) => link?.scrollIntoView({ block: "nearest" })
                          : undefined
                      }
                    >
                      <span class={styles.name}>{screenshot.comparison.name}</span>
                      {screenshot.comparison.kind === "missing" && (
                        <span class={styles.new}>New</span>
                      )}
                    </a>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
