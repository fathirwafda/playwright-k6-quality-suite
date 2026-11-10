// Shared configuration for k6 scripts. Runs in the k6 runtime (not Node):
// only k6 built-ins, relative imports and remote jslib URLs are available.

export const QUICKPIZZA_BASE_URL = __ENV.QUICKPIZZA_BASE_URL || 'https://quickpizza.grafana.com';
export const BOOKER_BASE_URL = __ENV.BOOKER_BASE_URL || 'https://restful-booker.herokuapp.com';

// QuickPizza accepts any 16-character token; this one is used in Grafana's own k6 tutorials.
export const QUICKPIZZA_TOKEN = __ENV.QUICKPIZZA_TOKEN || 'abcdef0123456789';

// Shared thresholds. Generous p95 because these are shared public demo hosts
// reached over the internet, not a controlled environment.
export const baseThresholds = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(95)<800'],
  checks: ['rate>0.99'],
};

export const jsonHeaders = { 'Content-Type': 'application/json', Accept: 'application/json' };
