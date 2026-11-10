import { test as base } from '@playwright/test';
import { BookingClient } from '../api/BookingClient';

export const BOOKER_USERNAME = process.env.BOOKER_USERNAME ?? 'admin';
export const BOOKER_PASSWORD = process.env.BOOKER_PASSWORD ?? 'password123';

interface ApiFixtures {
  /** Unauthenticated client. */
  booker: BookingClient;
  /** Client holding a fresh auth token. */
  authedBooker: BookingClient;
  /** Register a booking id to be deleted after the test, whatever its outcome. */
  cleanup: (bookingId: number) => void;
}

export const test = base.extend<ApiFixtures>({
  booker: async ({ request }, use) => use(new BookingClient(request)),

  authedBooker: async ({ request }, use) => {
    const client = new BookingClient(request);
    await client.authenticate(BOOKER_USERNAME, BOOKER_PASSWORD);
    await use(client);
  },

  cleanup: async ({ request }, use) => {
    const ids = new Set<number>();
    await use((id) => ids.add(id));
    if (ids.size === 0) return;
    const client = new BookingClient(request);
    await client.authenticate(BOOKER_USERNAME, BOOKER_PASSWORD);
    for (const id of ids) {
      // Best effort: a test may already have deleted it (404/405 is fine here).
      await client.rawDelete(id);
    }
  },
});

export { expect } from '@playwright/test';
