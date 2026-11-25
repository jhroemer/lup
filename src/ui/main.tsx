import { render } from "preact";
import type { Report } from "../types.ts";
import { App } from "./App.tsx";
import { getReportScreenshots } from "./screenshot.ts";
import "./style.css";

const report: Report = JSON.parse(document.getElementById("report")!.textContent);

render(<App screenshots={getReportScreenshots(report)} />, document.getElementById("app")!);
