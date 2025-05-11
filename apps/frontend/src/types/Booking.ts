import type { Booking } from "@shared/types/booking.ts";

export interface BookingWithFlags extends Booking {
  isStartDay: boolean;
}

export type BookingsByDayByRoomId = Record<number, Record<string, BookingWithFlags>>;
