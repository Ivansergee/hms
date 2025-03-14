import { defineStore } from "pinia";
import { type Booking } from "@/types/Booking.ts";
import { ref } from "vue";
import { bookingQueries } from "@/queries/bookingQueries.ts";

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

  const editBooking = async (editData: Booking): Promise<Booking | undefined> => {
    const editedBooking = await bookingQueries.editBooking(editData);
    const index = bookings.value.findIndex(booking => booking.id === editedBooking.id);
    if (index !== -1) {
      bookings.value[index] = editedBooking;
      return editedBooking;
    }
  };

  const deleteBooking = async (id: number): Promise<void> => {
    await bookingQueries.deleteBooking(id);
  }

  return { bookings, fetchBookings, createBooking, editBooking, deleteBooking };
});
