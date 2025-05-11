import { defineStore } from "pinia";
import {  type BookingsByDayByRoomId } from "@/types/Booking.ts";
import { computed, ref } from "vue";
import { bookingQueries } from "@/queries/bookingQueries.ts";
import { fromISOString, isSameDay, toISOString } from "@/utils/dateTimeUtils.ts";
import { getBookingsMap } from "@/utils/planTableUtils.ts";
import type { Booking, BookingCreate } from "@shared/types/booking.ts";

export const useBookingStore = defineStore('bookings', () => {
  const bookings = ref<Booking[]>([]);
  const rangeStart = ref<string>('');
  const rangeEnd = ref<string>('');

  const fetch = async (from: string, to: string): Promise<void> => {
    rangeStart.value = from;
    rangeEnd.value = to;
    const bookingsData = await bookingQueries.fetch(from, to);
    bookings.value = bookingsData.map(booking => ({
      ...booking,
      start: fromISOString(booking.start),
      end: fromISOString(booking.end),
    }));
  };

  const bookingsMap = computed((): BookingsByDayByRoomId => {
    return getBookingsMap(bookings.value, rangeStart.value, rangeEnd.value);
  });

  const createBooking = async (createData: BookingCreate): Promise<Booking> => {
    const newBooking = await bookingQueries.createBooking({
      ...createData,
      start: toISOString( createData.start),
      end: toISOString(createData.end),
    });
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
    bookingsMap,
    fetch,
    createBooking,
    editBooking,
    deleteBooking,
    getById,
    getRoomBookings,
    getByRoomAndDay,
  };
});
