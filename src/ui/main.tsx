import { render } from "preact";
import type { Report } from "../types.ts";
import { App } from "./App.tsx";
import "./style.css";

const report: Report = JSON.parse(document.getElementById("report")!.textContent);
const renderApp = () => render(<App report={report} />, document.getElementById("app")!);

addEventListener("hashchange", renderApp);
renderApp();

addEventListener("keydown", (event) => {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("nav a"));
  const selected = links.findIndex((link) => link.hash === (location.hash || "#/"));
  const next = links[selected + (event.key === "ArrowDown" ? 1 : -1)];
  if (!next) return;
  event.preventDefault();
  next.focus();
  location.replace(next.href);
});
