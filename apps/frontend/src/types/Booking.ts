export interface Booking {
  id: number;
  roomId: number;
  start: string;
  end: string;
  guestId: number;
}

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
