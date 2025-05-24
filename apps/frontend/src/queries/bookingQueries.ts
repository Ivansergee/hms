import fetcher from "@/queries/fetcher.ts";
import type {
  BookingShort,
  BookingCreate,
  BookingDetails,
  BookingEditPlacement,
} from "@shared/types/booking.ts";

export const bookingQueries = {
  async fetch(from: string, to: string): Promise<BookingShort[]> {

    return fetcher.post<BookingShort[]>('/booking/filter', {
      start: from,
      end: to,
    });
  },

  async getDetails(id: number): Promise<BookingDetails> {
      return fetcher.get<BookingDetails>(`/booking/details/${id}`);
  },

  async createBooking(createData: BookingCreate): Promise<BookingShort> {
    return fetcher.post<BookingShort>('/booking', createData);
  },

  // async editBooking (editData: BookingShort): Promise<BookingShort> {
  //   return fetcher.put<BookingShort>(`/booking`, editData, { id: editData.id });
  // },

  async editPlacement(id: number, editData: BookingEditPlacement): Promise<BookingShort> {
    return fetcher.patch<BookingShort>(
      `/booking/${id}/placement`,
      {
        start: editData.start,
        end: editData.end,
        roomId: editData.roomId,
      }
    );
  },

  async deleteBooking(id: number): Promise<boolean> {
    await new Promise(r => setTimeout(r, 100));

    return true;
  },
};
