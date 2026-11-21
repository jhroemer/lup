import type { Base64Png, Report } from "../report.ts";
import "./style.css";

function renderReport(report: Report): DocumentFragment {
  const fragment = document.createDocumentFragment();
  fragment.append(
    Object.assign(document.createElement("h1"), { textContent: "Screenshot report" }),
  );
  for (const test of report.tests) {
    const section = document.createElement("section");
    section.append(
      Object.assign(document.createElement("h2"), {
        textContent: test.titlePath.filter(Boolean).join(" › "),
      }),
    );
    for (const attempt of test.attempts) {
      section.append(
        Object.assign(document.createElement("h3"), {
          textContent: `Attempt ${attempt.retry + 1}: ${attempt.status}`,
        }),
      );
      for (const comparison of attempt.comparisons) {
        section.append(
          Object.assign(document.createElement("h4"), {
            textContent: `${comparison.name} (${comparison.kind})`,
          }),
        );
        let images: [label: string, png: Base64Png][];
        switch (comparison.kind) {
          case "mismatch":
            images = [
              ["expected", comparison.expected],
              ["actual", comparison.actual],
              ["diff", comparison.diff],
            ];
            break;
          case "missing":
            images = [["actual", comparison.actual]];
            break;
          case "unstable":
            images = [
              ["previous", comparison.previous],
              ["actual", comparison.actual],
              ["diff", comparison.diff],
            ];
            if (comparison.expected) images.unshift(["expected", comparison.expected]);
            break;
          case "unrecognized":
            images = [];
            section.append(
              Object.assign(document.createElement("p"), {
                textContent: `Unrecognized attachments: ${comparison.attachmentNames.join(", ")}`,
              }),
            );
            break;
          default:
            images = comparison satisfies never;
        }
        const figures = Object.assign(document.createElement("div"), { className: "figures" });
        for (const [label, png] of images) {
          const figure = document.createElement("figure");
          figure.append(
            Object.assign(document.createElement("img"), {
              alt: `${comparison.name} ${label}`,
              src: `data:image/png;base64,${png}`,
            }),
            Object.assign(document.createElement("figcaption"), { textContent: label }),
          );
          figures.append(figure);
        }
        section.append(figures);
      }
    }
    fragment.append(section);
  }
  return fragment;
}

const report: Report = JSON.parse(document.getElementById("report")!.textContent);
document.querySelector<HTMLDivElement>("#app")!.replaceChildren(renderReport(report));
