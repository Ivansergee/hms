import type { Booking, BookingsByDayByRoomId } from "@/types/Booking.ts";
import { getDaysRange } from "@/utils/dateTimeUtils.ts";
import dayjs from "dayjs";
import type { GhostBooking } from "@/components/PlanTable/GhostBar.vue";

export interface RoomData {
  id: number;
  name: string;
}

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
    const firstVisibleDayIndex = daysInRange.findIndex(day => dayjs(day).isBetween(start, end, 'day', '[]'));

    daysInRange.forEach(day => {
      map[booking.roomId][day] = {
        ...booking,
        isStartDay: day === firstVisibleDay,
        startDayIndex: firstVisibleDayIndex ?? 0,
      };
    });
  });

  return map;
}

export function getNewBooking(roomId: number, day: string): GhostBooking {
  return {
    roomId,
    start: day,
    end: day,
  };
}
