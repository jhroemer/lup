const modes = ["expected", "actual", "diff", "previous"] as const;

export type Mode = (typeof modes)[number];

export function screenshotUrl(index: number, mode: Mode) {
  return `#/${index}/${mode}`;
}

export function parseScreenshotUrl(hash: string): { index: number | undefined; mode: Mode } {
  const [, index, mode] = hash.match(/^#\/(\d+)\/(\w+)$/) ?? [];
  return {
    index: index === undefined ? undefined : Number(index),
    mode: modes.find((known) => known === mode) ?? "actual",
  };
}
