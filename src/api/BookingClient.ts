import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { z } from 'zod';
import {
  AuthFailureSchema,
  AuthSuccessSchema,
  BookingIdListSchema,
  BookingSchema,
  CreatedBookingSchema,
  type Booking,
  type BookingInput,
  type CreatedBooking,
} from './schemas';

export interface BookingFilter {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
}

/** Thrown when a response body does not match its zod schema. */
export class SchemaError extends Error {
  constructor(
    readonly endpoint: string,
    readonly issues: z.core.$ZodIssue[],
    readonly body: unknown,
  ) {
    super(`Schema mismatch for ${endpoint}: ${JSON.stringify(issues, null, 2)}`);
  }
}

export async function parseBody<S extends z.ZodType>(
  response: APIResponse,
  schema: S,
): Promise<z.infer<S>> {
  const body: unknown = await response.json();
  const result = schema.safeParse(body);
  if (!result.success) throw new SchemaError(response.url(), result.error.issues, body);
  return result.data;
}

/**
 * Typed client for https://restful-booker.herokuapp.com.
 *
 * "raw" methods return the APIResponse for negative tests; the typed methods
 * assert the happy-path status and validate the body with zod.
 */
export class BookingClient {
  private token: string | undefined;

  constructor(private readonly request: APIRequestContext) {}

  // ---- auth ---------------------------------------------------------------

  rawAuth(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  async authenticate(username: string, password: string): Promise<string> {
    const res = await this.rawAuth(username, password);
    await expectStatus(res, 200);
    const { token } = await parseBody(res, AuthSuccessSchema);
    this.token = token;
    return token;
  }

  async authFailureReason(username: string, password: string): Promise<string> {
    const res = await this.rawAuth(username, password);
    // The API answers bad credentials with 200 + a reason body (documented behaviour).
    await expectStatus(res, 200);
    return (await parseBody(res, AuthFailureSchema)).reason;
  }

  private authHeaders(token = this.token): Record<string, string> {
    return token ? { Cookie: `token=${token}` } : {};
  }

  // ---- health -------------------------------------------------------------

  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  // ---- bookings -----------------------------------------------------------

  rawCreate(data: unknown): Promise<APIResponse> {
    return this.request.post('/booking', { data });
  }

  async create(data: BookingInput): Promise<CreatedBooking> {
    const res = await this.rawCreate(data);
    await expectStatus(res, 200);
    return parseBody(res, CreatedBookingSchema);
  }

  rawGet(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  async get(id: number): Promise<Booking> {
    const res = await this.rawGet(id);
    await expectStatus(res, 200);
    return parseBody(res, BookingSchema);
  }

  async list(filter: BookingFilter = {}): Promise<number[]> {
    const params = Object.fromEntries(
      Object.entries(filter).filter((entry): entry is [string, string] => entry[1] !== undefined),
    );
    const res = await this.request.get('/booking', { params });
    await expectStatus(res, 200);
    return (await parseBody(res, BookingIdListSchema)).map((b) => b.bookingid);
  }

  rawUpdate(id: number, data: unknown, token = this.token): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data, headers: this.authHeaders(token) });
  }

  async update(id: number, data: BookingInput): Promise<Booking> {
    const res = await this.rawUpdate(id, data);
    await expectStatus(res, 200);
    return parseBody(res, BookingSchema);
  }

  rawPatch(id: number, data: unknown, token = this.token): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data, headers: this.authHeaders(token) });
  }

  async patch(id: number, data: Partial<BookingInput>): Promise<Booking> {
    const res = await this.rawPatch(id, data);
    await expectStatus(res, 200);
    return parseBody(res, BookingSchema);
  }

  rawDelete(id: number, token = this.token): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: this.authHeaders(token) });
  }

  async delete(id: number): Promise<void> {
    const res = await this.rawDelete(id);
    // restful-booker returns 201 Created for a successful DELETE (documented quirk).
    await expectStatus(res, 201);
  }
}

async function expectStatus(res: APIResponse, expected: number): Promise<void> {
  if (res.status() !== expected) {
    const body = await res.text().catch(() => '<unreadable>');
    throw new Error(
      `${res.url()} returned ${res.status()} (expected ${expected}). Body: ${body.slice(0, 300)}`,
    );
  }
}
