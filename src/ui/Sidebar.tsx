import type { Screenshot } from "./screenshot.ts";
import styles from "./Sidebar.module.css";

export function Sidebar({
  screenshots,
  selected,
}: {
  screenshots: Screenshot[];
  selected: Screenshot | undefined;
}) {
  const tests = [...new Set(screenshots.map((screenshot) => screenshot.test))];

  return (
    <nav class={styles.sidebar}>
      <ul>
        <li>
          <a href="#/" aria-current={selected ? undefined : "page"}>
            All screenshots
          </a>
        </li>
        {tests.map((test) => (
          <li>
            <span>{test.titlePath.at(-1)}</span>
            <ul>
              {screenshots.map(
                (screenshot, index) =>
                  screenshot.test === test && (
                    <li>
                      <a
                        href={`#/${index}`}
                        aria-current={screenshot === selected ? "page" : undefined}
                      >
                        {screenshot.comparison.name}
                      </a>
                    </li>
                  ),
              )}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
