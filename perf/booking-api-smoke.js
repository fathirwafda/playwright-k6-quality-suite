// Tiny read-only smoke against restful-booker (2 VUs, 30s). No writes, so it
// leaves no data behind on the shared public API.
//   k6 run perf/booking-api-smoke.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BOOKER_BASE_URL, jsonHeaders } from './lib/config.js';
import { summaryWriter } from './lib/summary.js';

export const options = {
  vus: 2,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    // Heroku-hosted demo with cold starts: a looser budget than QuickPizza.
    http_req_duration: ['p(95)<1500'],
    checks: ['rate>0.99'],
  },
  tags: { suite: 'booking-api-smoke' },
};

export default function () {
  group('health', () => {
    const res = http.get(`${BOOKER_BASE_URL}/ping`, { tags: { name: 'GET /ping' } });
    check(res, { 'ping: status is 201': (r) => r.status === 201 });
  });

  group('list bookings', () => {
    const res = http.get(`${BOOKER_BASE_URL}/booking`, {
      headers: jsonHeaders,
      tags: { name: 'GET /booking' },
    });
    check(res, {
      'list: status is 200': (r) => r.status === 200,
      'list: is an array': (r) => Array.isArray(r.json()),
    });
  });

  sleep(1);
}

export const handleSummary = summaryWriter('booking-api-smoke');
