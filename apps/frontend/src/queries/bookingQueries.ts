import fetcher from '@/queries/fetcher';
import type {
  BookingShort,
  BookingCreate,
  BookingDetails,
  BookingPlacement,
} from '@shared/types/booking';
import type { BookingStatus } from '@shared/enums/BookingStatus.ts';
import type {
  BookingGuest,
  BookingGuestLinkExisting,
  BookingGuestSnapshotCreate,
  BookingGuestSnapshotUpdate,
} from '@shared/types/bookingGuest';

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

  async editPlacement(id: number, editData: BookingPlacement): Promise<BookingShort> {
    return fetcher.post<BookingShort>(`/booking/${id}/placement`, editData);
  },

  async deleteBooking(id: number): Promise<boolean> {
    void id;
    await new Promise((r) => setTimeout(r, 100));

    return true;
  },

  async setStatus(id: number, status: BookingStatus): Promise<BookingStatus> {
    return fetcher.post<BookingStatus>(`/booking/${id}/setStatus`, { status });
  },

  async createBookingGuestSnapshot(
    bookingId: number,
    body: BookingGuestSnapshotCreate,
  ): Promise<BookingGuest> {
    return fetcher.post<BookingGuest>(`/booking/${bookingId}/guests`, body);
  },

  async linkBookingGuest(
    bookingId: number,
    bookingGuestId: number,
    body: BookingGuestLinkExisting,
  ): Promise<BookingGuest> {
    return fetcher.post<BookingGuest>(`/booking/${bookingId}/guests/${bookingGuestId}/link`, body);
  },

  async createGuestFromBookingGuest(bookingId: number, bookingGuestId: number): Promise<BookingGuest> {
    return fetcher.post<BookingGuest>(`/booking/${bookingId}/guests/${bookingGuestId}/createGuest`, {});
  },

  async updateBookingGuestSnapshot(
    bookingId: number,
    bookingGuestId: number,
    body: BookingGuestSnapshotUpdate,
  ): Promise<BookingGuest> {
    return fetcher.put<BookingGuest>(`/booking/${bookingId}/guests/${bookingGuestId}/snapshot`, body);
  },

  async unlinkBookingGuest(bookingId: number, bookingGuestId: number): Promise<BookingGuest> {
    return fetcher.post<BookingGuest>(`/booking/${bookingId}/guests/${bookingGuestId}/unlink`, {});
  },

  async deleteBookingGuestSnapshot(bookingId: number, bookingGuestId: number): Promise<boolean> {
    return fetcher.delete<boolean>(`/booking/${bookingId}/guests/${bookingGuestId}`);
  },
};
