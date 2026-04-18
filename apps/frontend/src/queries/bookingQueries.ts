import fetcher from "@/queries/fetcher";
import type {
  BookingShort,
  BookingCreate,
  BookingDetails,
  BookingPlacement,
} from "@shared/types/booking";

export const bookingQueries = {
  async fetch(from: string, to: string): Promise<BookingShort[]> {

    return fetcher.post<BookingShort[]>('/booking/filter', {
      checkInDate: from,
      checkOutDate: to,
    });
  },

  async getDetails(id: number): Promise<BookingDetails> {
      return fetcher.get<BookingDetails>(`/booking/${id}/details`);
  },

  async createBooking(createData: BookingCreate): Promise<BookingShort> {
    return fetcher.post<BookingShort>('/booking', createData);
  },

  // async editBooking (editData: BookingShort): Promise<BookingShort> {
  //   return fetcher.put<BookingShort>(`/booking`, editData, { id: editData.id });
  // },

  async editPlacement(id: number, editData: BookingPlacement): Promise<BookingShort> {
    return fetcher.patch<BookingShort>(`/booking/${id}/placement`, editData);
  },

  async deleteBooking(id: number): Promise<boolean> {
    await new Promise(r => setTimeout(r, 100));

    return true;
  },
};
