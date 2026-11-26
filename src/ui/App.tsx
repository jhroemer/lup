import { useEffect, useState } from "preact/hooks";
import styles from "./App.module.css";
import logo from "./assets/logo.svg";
import { OverviewPage } from "./OverviewPage.tsx";
import type { Screenshot } from "./screenshot.ts";
import { ScreenshotPage } from "./ScreenshotPage.tsx";
import { parseScreenshotUrl } from "./screenshotUrl.ts";
import { Sidebar } from "./Sidebar.tsx";

export function App({ screenshots }: { screenshots: Screenshot[] }) {
  const [hash, setHash] = useState(location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(location.hash);
    addEventListener("hashchange", onHashChange);
    return () => removeEventListener("hashchange", onHashChange);
  }, []);

  const { index, mode } = parseScreenshotUrl(hash);
  const selected = index === undefined ? undefined : screenshots[index];

  return (
    <div class={styles.app}>
      <header class={styles.topbar}>
        <a href="#/">
          <img src={logo} alt="lup, all screenshots" />
        </a>
      </header>
      <Sidebar screenshots={screenshots} selected={selected} mode={mode} />
      <main class={styles.main}>
        {selected ? (
          <ScreenshotPage screenshot={selected} mode={mode} />
        ) : (
          <OverviewPage screenshots={screenshots} mode={mode} />
        )}
      </main>
    </div>
  );
}
