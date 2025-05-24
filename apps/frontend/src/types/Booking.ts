import type { BookingShort } from "@shared/types/booking.ts";

export interface BookingWithFlags extends BookingShort {
  isStartDay: boolean;
}

export type BookingsByDayByRoomId = Record<number, Record<string, BookingWithFlags>>;
