import { faker } from '@faker-js/faker';
import type { BookingInput } from '../api/schemas';

const isoDate = (d: Date): string => d.toISOString().slice(0, 10);

/**
 * Builds a valid booking payload. Names get a unique suffix so filter tests
 * can find exactly the bookings they created on a shared public API.
 */
export function buildBooking(overrides: Partial<BookingInput> = {}): BookingInput {
  const checkin = faker.date.soon({ days: 30 });
  const checkout = faker.date.soon({ days: 14, refDate: checkin });
  const suffix = faker.string.alphanumeric(6).toLowerCase();

  return {
    firstname: `${faker.person.firstName()}${suffix}`,
    lastname: `${faker.person.lastName()}${suffix}`,
    totalprice: faker.number.int({ min: 50, max: 2000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: { checkin: isoDate(checkin), checkout: isoDate(checkout) },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late checkout', 'Parking']),
    ...overrides,
  };
}
