import http from 'k6/http';
import { check, group } from 'k6';
import { jsonHeaders, QUICKPIZZA_BASE_URL, QUICKPIZZA_TOKEN } from './config.js';

const restrictionsPool = [
  {
    maxCaloriesPerSlice: 1000,
    mustBeVegetarian: false,
    maxNumberOfToppings: 5,
    minNumberOfToppings: 2,
  },
  {
    maxCaloriesPerSlice: 700,
    mustBeVegetarian: true,
    maxNumberOfToppings: 4,
    minNumberOfToppings: 2,
  },
  {
    maxCaloriesPerSlice: 500,
    mustBeVegetarian: false,
    maxNumberOfToppings: 3,
    minNumberOfToppings: 1,
  },
];

/** One user journey: open the home page, then ask for a pizza recommendation. */
export function pizzaJourney() {
  group('home page', () => {
    const res = http.get(`${QUICKPIZZA_BASE_URL}/`, { tags: { name: 'GET /' } });
    check(res, {
      'home: status is 200': (r) => r.status === 200,
      'home: has body': (r) => (r.body || '').length > 0,
    });
  });

  group('recommend pizza', () => {
    const base = restrictionsPool[Math.floor(Math.random() * restrictionsPool.length)];
    const payload = JSON.stringify({ ...base, excludedIngredients: [], excludedTools: [] });
    const res = http.post(`${QUICKPIZZA_BASE_URL}/api/pizza`, payload, {
      headers: { ...jsonHeaders, Authorization: `token ${QUICKPIZZA_TOKEN}` },
      tags: { name: 'POST /api/pizza' },
    });
    check(res, {
      'pizza: status is 200': (r) => r.status === 200,
      'pizza: has a name': (r) => typeof safeJson(r, 'pizza.name') === 'string',
      'pizza: respects vegetarian restriction': (r) =>
        !base.mustBeVegetarian || safeJson(r, 'vegetarian') === true,
    });
  });
}

function safeJson(res, selector) {
  try {
    return res.json(selector);
  } catch {
    return undefined;
  }
}
