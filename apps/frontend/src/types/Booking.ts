import type { Booking } from "@shared/types/booking.ts";

export interface BookingWithFlags extends Booking {
  isStartDay: boolean;
  startDayIndex: number;
}

export interface GhostBooking {
  id?: number;
  roomId: number;
  start: string;
  end: string;
}

export type BookingsByDayByRoomId = Record<number, Record<string, BookingWithFlags>>;
