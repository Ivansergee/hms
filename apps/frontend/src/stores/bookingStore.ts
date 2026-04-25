import { defineStore } from "pinia";
import { ref } from "vue";
import { bookingQueries } from "@/queries/bookingQueries";
import { isSameDay } from "@/utils/dateTimeUtils";
import { type BookingShort, type BookingCreate } from "@shared/types/booking";
import type { BookingStatus } from "@shared/enums/BookingStatus.ts";

export const useBookingStore = defineStore('bookings', () => {
  const bookings = ref<BookingShort[]>([]);
  const rangeStart = ref<string>('');
  const rangeEnd = ref<string>('');

  const fetch = async (from: string, to: string): Promise<void> => {
    rangeStart.value = from;
    rangeEnd.value = to;
    bookings.value = await bookingQueries.fetch(from, to);
  };

  const createBooking = async (createData: BookingCreate): Promise<BookingShort> => {
    const newBooking = await bookingQueries.createBooking(createData);
    bookings.value.push(newBooking);
    return newBooking;
  };

  const editPlacement = async (editData: BookingShort): Promise<BookingShort | undefined> => {
    const editedBooking = await bookingQueries.editPlacement(
      editData.id,
      {
        checkInDate: editData.checkInDate,
        checkOutDate: editData.checkOutDate,
        roomId: editData.roomId,
      }
    );
    const index = bookings.value.findIndex(booking => booking.id === editedBooking.id);
    if (index !== -1) {
      bookings.value[index] = editedBooking;
      return editedBooking;
    }
  };

  const deleteBooking = async (id: number): Promise<void> => {
    await bookingQueries.deleteBooking(id);
  }

  const getById = (id?: number): BookingShort | undefined => {
    return bookings.value.find(booking => booking.id === id);
  };

  const getRoomBookings = (roomId: number): BookingShort[] => {
    return bookings.value.filter(booking => booking.roomId === roomId);
  };

  const getByRoomAndDay = (roomId: number, day: string): BookingShort | undefined => {
    const roomBookings = getRoomBookings(roomId);
    return roomBookings?.find(booking => isSameDay(booking.checkInDate, day));
  };

  const setStatus = async (id: number, status: BookingStatus): Promise<void> => {
    const booking = bookings.value.find(b => b.id === id);
    if (!booking) {
      return;
    }

    const previousStatus = booking.status;
    booking.status = status;

    try {
      await bookingQueries.setStatus(id, status);
    } catch (error) {
      booking.status = previousStatus;
      console.error("Failed to update status, rolling back...", error);
    }
  };

  return {
    bookings,
    fetch,
    createBooking,
    editPlacement,
    deleteBooking,
    getById,
    getRoomBookings,
    getByRoomAndDay,
    setStatus,
  };
});
