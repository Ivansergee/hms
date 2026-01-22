import { defineStore } from "pinia";
import { type BookingsByDayByRoomId } from "@/types/Booking";
import { computed, ref } from "vue";
import { bookingQueries } from "@/queries/bookingQueries";
import { isSameDay } from "@/utils/dateTimeUtils";
import { getBookingsMap } from "@/utils/planTableUtils";
import { type BookingShort, type BookingCreate } from "@shared/types/booking";

export const useBookingStore = defineStore('bookings', () => {
  const bookings = ref<BookingShort[]>([]);
  const rangeStart = ref<string>('');
  const rangeEnd = ref<string>('');

  const fetch = async (from: string, to: string): Promise<void> => {
    rangeStart.value = from;
    rangeEnd.value = to;
    bookings.value = await bookingQueries.fetch(from, to);
  };

  const bookingsMap = computed<BookingsByDayByRoomId>(() => {
    return getBookingsMap(bookings.value, rangeStart.value, rangeEnd.value);
  });

  const createBooking = async (createData: BookingCreate): Promise<BookingShort> => {
    const newBooking = await bookingQueries.createBooking({
      ...createData,
      checkInDate: createData.checkInDate,
      checkOutDate: createData.checkOutDate,
    });
    bookings.value.push(newBooking);
    return newBooking;
  };

  const editPlacement = async (editData: BookingShort): Promise<BookingShort | undefined> => {
    const editedBooking = await bookingQueries.editPlacement(
      editData.id,
      {
        checkInDate: editData.checkInDate,
        checkOutDate: editData.checkOutDate,
        arrivalMinutes: editData.arrivalMinutes,
        departureMinutes: editData.departureMinutes,
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

  return {
    bookings,
    bookingsMap,
    fetch,
    createBooking,
    editPlacement,
    deleteBooking,
    getById,
    getRoomBookings,
    getByRoomAndDay,
  };
});
