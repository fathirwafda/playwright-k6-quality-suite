import { BOOKER_PASSWORD, BOOKER_USERNAME, expect, test } from '../../src/fixtures/api';

test.describe('Health and auth @api', () => {
  test('GET /ping reports the service is up @smoke', async ({ booker }) => {
    const res = await booker.ping();
    // restful-booker answers health checks with 201 Created (documented quirk).
    expect(res.status()).toBe(201);
  });

  test('POST /auth returns a token for valid credentials @smoke', async ({ booker }) => {
    const token = await booker.authenticate(BOOKER_USERNAME, BOOKER_PASSWORD);
    expect(token).toMatch(/^[a-f0-9]{10,}$/);
  });

  const badCreds = [
    { name: 'wrong password', username: BOOKER_USERNAME, password: 'wrong' },
    { name: 'unknown user', username: 'nobody', password: BOOKER_PASSWORD },
    { name: 'empty credentials', username: '', password: '' },
  ];

  for (const c of badCreds) {
    test(`POST /auth rejects ${c.name} @regression`, async ({ booker }) => {
      expect(await booker.authFailureReason(c.username, c.password)).toBe('Bad credentials');
    });
  }
});
