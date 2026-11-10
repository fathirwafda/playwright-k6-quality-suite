// Smoke: 1 VU for 30s. Proves the script and target work before any load test.
//   k6 run perf/quickpizza-smoke.js
import { sleep } from 'k6';
import { baseThresholds } from './lib/config.js';
import { pizzaJourney } from './lib/quickpizza.js';
import { summaryWriter } from './lib/summary.js';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: baseThresholds,
  tags: { suite: 'quickpizza-smoke' },
};

export default function () {
  pizzaJourney();
  sleep(1);
}

export const handleSummary = summaryWriter('quickpizza-smoke');
