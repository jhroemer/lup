import { render } from "preact";
import type { Report } from "../types.ts";
import { App } from "./App.tsx";
import "./style.css";

const report: Report = JSON.parse(document.getElementById("report")!.textContent);
render(<App report={report} />, document.getElementById("app")!);
