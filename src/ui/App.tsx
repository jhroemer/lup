import type { Base64Png, Report, ScreenshotComparison } from "../types.ts";

function images(comparison: ScreenshotComparison): [label: string, png: Base64Png][] {
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
      const unstableImages: [label: string, png: Base64Png][] = [
        ["previous", comparison.previous],
        ["actual", comparison.actual],
        ["diff", comparison.diff],
      ];
      if (comparison.expected) unstableImages.unshift(["expected", comparison.expected]);
      return unstableImages;
    }
    case "unrecognized":
      return [];
    default:
      return comparison satisfies never;
  }
}

export function App({ report }: { report: Report }) {
  return (
    <>
      <h1>Screenshot report</h1>
      {report.tests.map((test) => (
        <section>
          <h2>{test.titlePath.filter(Boolean).join(" › ")}</h2>
          {test.attempts.map((attempt) => (
            <>
              <h3>
                Attempt {attempt.retry + 1}: {attempt.status}
              </h3>
              {attempt.comparisons.map((comparison) => (
                <>
                  <h4>
                    {comparison.name} ({comparison.kind})
                  </h4>
                  {comparison.kind === "unrecognized" && (
                    <p>Unrecognized attachments: {comparison.attachmentNames.join(", ")}</p>
                  )}
                  <div class="figures">
                    {images(comparison).map(([label, png]) => (
                      <figure>
                        <img
                          alt={`${comparison.name} ${label}`}
                          src={`data:image/png;base64,${png}`}
                        />
                        <figcaption>{label}</figcaption>
                      </figure>
                    ))}
                  </div>
                </>
              ))}
            </>
          ))}
        </section>
      ))}
    </>
  );
}
