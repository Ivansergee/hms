import { type Booking } from "@/types/Booking.ts";

export const bookings: Booking[] = [
  { id: 1, roomId: 1, start: '2025-02-17 08:00', end: '2025-02-19 20:00', guestId: 1 },
  { id: 2, roomId: 2, start: '2025-03-09 14:00', end: '2025-03-12 12:00', guestId: 2 }
];

export const bookingQueries = {
  async fetchBookings(): Promise<Booking[]> {
    await new Promise(r => setTimeout(r, 200));

    return bookings;
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
