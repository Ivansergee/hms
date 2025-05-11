import type { BookingsByDayByRoomId, BookingWithFlags } from "@/types/Booking.ts";
import { addDays, getDaysRange, setTimeOnDate } from "@/utils/dateTimeUtils.ts";
import dayjs from "dayjs";
import type { Booking } from "@shared/types/booking.ts";
import { BookingStatus } from "@shared/generated/enums.ts";

export enum ResizeDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

export const CELL_WIDTH = 100;

export function getBookingsMap(bookings: Booking[], start: string, end: string): BookingsByDayByRoomId {
  const map: BookingsByDayByRoomId = {};

  bookings.forEach(booking => {
    if (!map[booking.roomId]) {
      map[booking.roomId] = {};
    }

    const daysInRange = getDaysRange(booking.start, booking.end);
    const firstVisibleDay = daysInRange.find(day => dayjs(day).isBetween(start, end, 'day', '[]'));

    daysInRange.forEach(day => {
      map[booking.roomId][day] = {
        ...booking,
        isStartDay: day === firstVisibleDay,
      };
    });
  });

  return map;
}

export function getInitialBookingData(day: string, roomId: number): BookingWithFlags {
  return {
    isStartDay: true,
    id: Date.now(),
    roomId: roomId,
    start: `${day} 14:00`,
    end: setTimeOnDate(addDays(day, 1), '12:00'),
    guestId: Date.now(),
    status: BookingStatus.ACTIVE,
    mainGuest: { firstName: '', lastName: '' },
    createdAt: '',
    updatedAt: '',
  };
}
