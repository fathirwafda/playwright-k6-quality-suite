import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

export const BookingDatesSchema = z.object({
  checkin: isoDate,
  checkout: isoDate,
});

export const BookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number().int(),
  depositpaid: z.boolean(),
  bookingdates: BookingDatesSchema,
  additionalneeds: z.string().optional(),
});

export const CreatedBookingSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

export const BookingIdListSchema = z.array(z.object({ bookingid: z.number().int().positive() }));

export const AuthSuccessSchema = z.object({ token: z.string().min(1) });
export const AuthFailureSchema = z.object({ reason: z.literal('Bad credentials') });

export type Booking = z.infer<typeof BookingSchema>;
export type BookingInput = Booking;
export type CreatedBooking = z.infer<typeof CreatedBookingSchema>;
