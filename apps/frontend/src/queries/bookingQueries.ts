import { type Booking, type BookingsByDayByRoomId } from "@/types/Booking.ts";
import dayjs from "dayjs";
import { getBookingsMap } from "@/utils/planTableUtils.ts";

export const bookings: Booking[] = [
  { id: 1, roomId: 1, start: '2025-02-25 08:00', end: '2025-03-05 20:00', guestId: 1 },
  { id: 2, roomId: 2, start: '2025-03-09 14:00', end: '2025-03-12 12:00', guestId: 2 },
  // { id: 3, roomId: 3, start: '2025-03-05 08:00', end: '2025-03-10 20:00', guestId: 1 },
  // { id: 4, roomId: 4, start: '2025-03-10 14:00', end: '2025-04-01 12:00', guestId: 2 },
  { id: 5, roomId: 5, start: '2025-02-02 08:00', end: '2025-02-06 20:00', guestId: 1 },
  { id: 6, roomId: 2, start: '2025-02-09 14:00', end: '2025-02-12 12:00', guestId: 2 },
  { id: 7, roomId: 3, start: '2025-02-05 08:00', end: '2025-02-08 20:00', guestId: 1 },
  { id: 8, roomId: 7, start: '2025-04-09 14:00', end: '2025-04-12 12:00', guestId: 2 },
  { id: 9, roomId: 4, start: '2025-04-02 08:00', end: '2025-04-06 20:00', guestId: 1 },
  { id: 10, roomId: 7, start: '2025-04-09 14:00', end: '2025-04-12 12:00', guestId: 2 },
];

export const bookingQueries = {
  async fetchBookings(from: string, to: string): Promise<Booking[]> {
    await new Promise(r => setTimeout(r, 200));

    const fromDate = dayjs(from);
    const toDate = dayjs(to);

    return bookings.filter(booking =>
      dayjs(booking.start).isBefore(toDate) && dayjs(booking.end).isAfter(fromDate)
    );
  },

  async createBooking(createData: Omit<Booking, 'id'>): Promise<Booking> {
    await new Promise(r => setTimeout(r, 100));

    return { ...createData, id: Date.now() };
  },

  async editBooking (editData: Booking): Promise<Booking> {
    await new Promise(r => setTimeout(r, 100));

    return editData;
  },

  async deleteBooking(id: number): Promise<boolean> {
    await new Promise(r => setTimeout(r, 100));

    return true;
  },
};
