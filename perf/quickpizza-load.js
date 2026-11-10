// Load: ramp to a polite 10 VUs on a shared public demo target (~1m40s total).
//   k6 run perf/quickpizza-load.js
// Shorter/smaller run with the same shape and thresholds (e.g. ~40s, 5 VUs):
//   k6 run -e PEAK_VUS=5 -e STAGE_SCALE=0.4 perf/quickpizza-load.js
import { sleep } from 'k6';
import { baseThresholds } from './lib/config.js';
import { pizzaJourney } from './lib/quickpizza.js';
import { summaryWriter } from './lib/summary.js';

// Hard cap of 10 VUs: this is a shared public demo, never raise it via env.
const PEAK_VUS = Math.min(Number(__ENV.PEAK_VUS || 10), 10);
const STAGE_SCALE = Number(__ENV.STAGE_SCALE || 1);
const WARMUP_VUS = Math.max(1, Math.round(PEAK_VUS / 2));

/** Scales a duration given in seconds and formats it for k6, e.g. 50 * 0.4 -> "20s". */
const secs = (s) => `${Math.max(1, Math.round(s * STAGE_SCALE))}s`;

export const options = {
  scenarios: {
    ramping_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: secs(20), target: WARMUP_VUS }, // warm up
        { duration: secs(20), target: PEAK_VUS }, // ramp to peak
        { duration: secs(50), target: PEAK_VUS }, // hold steady state
        { duration: secs(10), target: 0 }, // ramp down
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    ...baseThresholds,
    // The recommendation endpoint does the real work; give it its own budget.
    'http_req_duration{name:POST /api/pizza}': ['p(95)<800', 'p(99)<1500'],
    // Abort early if the target is clearly unhealthy, to stay polite.
    http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: true, delayAbortEval: secs(20) }],
  },
  tags: { suite: 'quickpizza-load' },
};

export default function () {
  pizzaJourney();
  sleep(1 + Math.random()); // think time 1-2s
}

export const handleSummary = summaryWriter('quickpizza-load');
