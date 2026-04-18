import type { BookingShort } from "@shared/types/booking";

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
  CREATE = 'create',
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

export function isBookingPositionChanged(oldState: BookingShort, newState: BookingShort) {
  return oldState.checkInDate !== newState.checkInDate
    || oldState.checkOutDate !== newState.checkOutDate
    || oldState.roomId !== newState.roomId;
}
