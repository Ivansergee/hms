import fetcher from "@/queries/fetcher.ts";
import type { Booking, BookingCreate, BookingDetails } from "@shared/types/booking.ts";

export const bookingQueries = {
  async fetch(from: string, to: string): Promise<Booking[]> {

    return fetcher.post<Booking[]>('/booking/filter', {
      start: from,
      end: to,
    });
  },

  async getDetails(id: number): Promise<BookingDetails> {
      return fetcher.get<BookingDetails>(`/booking/details/${id}`);
  },

  async createBooking(createData: BookingCreate): Promise<Booking> {
    return fetcher.post<Booking>('/booking', createData);
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
