import { expect, test } from '../../src/fixtures/api';
import { buildBooking } from '../../src/data/bookingFactory';

const UNKNOWN_ID = 999_999_999;

test.describe('Booking negative cases @api @regression', () => {
  test('PUT without a token is forbidden', async ({ booker, cleanup }) => {
    const { bookingid } = await booker.create(buildBooking());
    cleanup(bookingid);

    const res = await booker.rawUpdate(bookingid, buildBooking());
    expect(res.status()).toBe(403);
  });

  test('PATCH with an invalid token is forbidden', async ({ booker, cleanup }) => {
    const { bookingid } = await booker.create(buildBooking());
    cleanup(bookingid);

    const res = await booker.rawPatch(bookingid, { totalprice: 1 }, 'not-a-real-token');
    expect(res.status()).toBe(403);
  });

  test('DELETE without a token is forbidden and the booking survives', async ({
    booker,
    cleanup,
  }) => {
    const input = buildBooking();
    const { bookingid } = await booker.create(input);
    cleanup(bookingid);

    expect((await booker.rawDelete(bookingid)).status()).toBe(403);
    expect(await booker.get(bookingid)).toEqual(input);
  });

  test('GET an unknown id returns 404', async ({ booker }) => {
    expect((await booker.rawGet(UNKNOWN_ID)).status()).toBe(404);
  });

  test('POST with missing required fields is rejected', async ({ booker }) => {
    const { firstname: _omitted, ...withoutFirstname } = buildBooking();
    const res = await booker.rawCreate(withoutFirstname);
    // The API does not validate gracefully: it returns 500 rather than 400.
    // We assert "not a success" and record the exact code for the report.
    expect(res.ok()).toBe(false);
    expect(res.status()).toBe(500);
  });

  test('POST with wrong field types is rejected', async ({ booker }) => {
    const res = await booker.rawCreate({ ...buildBooking(), bookingdates: 'tomorrow' });
    expect(res.ok()).toBe(false);
  });

  test('filter for a name that does not exist returns an empty list', async ({ booker }) => {
    expect(await booker.list({ firstname: `nobody-${Date.now()}` })).toEqual([]);
  });
});
