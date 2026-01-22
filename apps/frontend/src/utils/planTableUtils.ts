import type { BookingsByDayByRoomId, BookingWithFlags } from "@/types/Booking";
import { addDays, getDaysRange, setTimeOnDate } from "@/utils/dateTimeUtils";
import dayjs from "dayjs";
import type { BookingShort } from "@shared/types/booking";
import { BookingStatus } from "@shared/enums/BookingStatus";

export interface BookingWithLayout {
  booking: BookingShort,
  title: string,
  topOffset: number,
  leftOffset: number,
  length: number,
}

export enum ResizeDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

export enum DragMode {
  DRAG = 'drag',
  RESIZE = 'resize',
}

export interface ResizeEventPayload {
  direction: ResizeDirection;
  startX: number;
}

export interface DragEventPayload {
  grabOffsetX: number;
  grabOffsetY: number;
}

export const CELL_WIDTH = 120;
export const CELL_HEIGHT = 40;
const MINUTES_IN_DAY = 1440;
export const MINUTES_PER_PIXEL = MINUTES_IN_DAY / CELL_WIDTH;

export function getBookingsMap(
  bookings: BookingShort[],
  start: string,
  end: string,
): BookingsByDayByRoomId {
  const map: BookingsByDayByRoomId = {};

  bookings.forEach(booking => {
    if (!map[booking.roomId]) {
      map[booking.roomId] = {};
    }

    const daysInRange = getDaysRange(booking.checkInDate, booking.checkOutDate);
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

// export function getInitialBookingData(day: string, roomId: number): BookingWithFlags {
//   return {
//     isStartDay: true,
//     id: Date.now(),
//     roomId: roomId,
//     checkInDate: `${day} 14:00`,
//     checkOutDate: setTimeOnDate(addDays(day, 1), '12:00'),
//     mainGuestId: Date.now(),
//     status: BookingStatus.ACTIVE,
//     guests: [],
//   };
// }

export function isBookingPositionChanged(oldState: BookingShort, newState: BookingShort) {
  return oldState.checkInDate !== newState.checkInDate
    || oldState.checkOutDate !== newState.checkOutDate
    || oldState.roomId !== newState.roomId;
}
