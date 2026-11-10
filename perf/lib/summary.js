import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';

/**
 * Builds a handleSummary() that prints the usual summary to stdout and writes
 * JSON + text copies to perf/results/<name>.{json,txt} (gitignored).
 * Paths are relative to the directory k6 is run from (the repo root).
 */
export function summaryWriter(name) {
  return function handleSummary(data) {
    const text = textSummary(data, { indent: ' ', enableColors: false });
    return {
      stdout: textSummary(data, { indent: ' ', enableColors: true }),
      [`perf/results/${name}.json`]: JSON.stringify(data, null, 2),
      [`perf/results/${name}.txt`]: text,
    };
  };
}
