import { defineStore } from "pinia";
import { type Booking } from "@/types/Booking.ts";
import { ref } from "vue";
import { bookingQueries } from "@/queries/bookingQueries.ts";
import { isSameDay } from "@/utils/dateTimeUtils.ts";

export const useBookingStore = defineStore('bookings', () => {
  const bookings = ref<Booking[]>([]);

  const fetchBookings = async (): Promise<void> => {
    bookings.value = await bookingQueries.fetchBookings();
  };

  const createBooking = async (createData: Omit<Booking, 'id'>): Promise<Booking> => {
    const newBooking = await bookingQueries.createBooking(createData);
    bookings.value.push(newBooking);
    return newBooking;
  };

  const editBooking = async (editData: Partial<Booking>): Promise<Booking | undefined> => {
    if (!editData.id) {
      return;
    }
    const booking = getById(editData.id);
    const payload = {
      ...booking,
      ...editData,
    } as Booking;
    const editedBooking = await bookingQueries.editBooking(payload);
    const index = bookings.value.findIndex(booking => booking.id === editedBooking.id);
    if (index !== -1) {
      bookings.value[index] = editedBooking;
      return editedBooking;
    }
  };

  const deleteBooking = async (id: number): Promise<void> => {
    await bookingQueries.deleteBooking(id);
  }

  const getById = (id?: number): Booking | undefined => {
    return bookings.value.find(booking => booking.id === id);
  };

  const getRoomBookings = (roomId: number): Booking[] => {
    return bookings.value.filter(booking => booking.roomId === roomId);
  };

  const getByRoomAndDay = (roomId: number, day: string): Booking | undefined => {
    const roomBookings = getRoomBookings(roomId);
    return roomBookings?.find(booking => isSameDay(booking.start, day));
  };

  return {
    bookings,
    fetchBookings,
    createBooking,
    editBooking,
    deleteBooking,
    getById,
    getRoomBookings,
    getByRoomAndDay,
  };
});
