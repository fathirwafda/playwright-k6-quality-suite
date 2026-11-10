import { expect, test } from '../../src/fixtures/api';
import { buildBooking } from '../../src/data/bookingFactory';

test.describe('Booking CRUD @api', () => {
  test('creates a booking and reads it back @smoke', async ({ booker, cleanup }) => {
    const input = buildBooking();
    const created = await booker.create(input);
    cleanup(created.bookingid);

    expect(created.booking).toEqual(input);
    expect(await booker.get(created.bookingid)).toEqual(input);
  });

  test('PUT replaces the whole booking when authorised @regression', async ({
    authedBooker,
    cleanup,
  }) => {
    const { bookingid } = await authedBooker.create(buildBooking());
    cleanup(bookingid);

    const replacement = buildBooking({ depositpaid: true, additionalneeds: 'Airport transfer' });
    const updated = await authedBooker.update(bookingid, replacement);

    expect(updated).toEqual(replacement);
    expect(await authedBooker.get(bookingid)).toEqual(replacement);
  });

  test('PATCH updates only the given fields @regression', async ({ authedBooker, cleanup }) => {
    const original = buildBooking();
    const { bookingid } = await authedBooker.create(original);
    cleanup(bookingid);

    const patched = await authedBooker.patch(bookingid, {
      totalprice: 999,
      additionalneeds: 'Dinner',
    });

    expect(patched).toEqual({ ...original, totalprice: 999, additionalneeds: 'Dinner' });
  });

  test('DELETE removes the booking @regression', async ({ authedBooker }) => {
    const { bookingid } = await authedBooker.create(buildBooking());

    await authedBooker.delete(bookingid);

    expect((await authedBooker.rawGet(bookingid)).status()).toBe(404);
  });

  test('filters bookings by first and last name @regression', async ({ booker, cleanup }) => {
    const target = buildBooking();
    const { bookingid } = await booker.create(target);
    cleanup(bookingid);

    // The public API is shared and occasionally slow to index; poll briefly.
    await expect
      .poll(() => booker.list({ firstname: target.firstname, lastname: target.lastname }), {
        timeout: 15_000,
      })
      .toEqual([bookingid]);
  });
});
