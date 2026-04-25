import type { BookingShort } from "@shared/types/booking";
import type { ItemType } from "ant-design-vue";
import { BookingContextMenuItem } from "@/enums/BookingContextMenuItem.ts";
import { translateEnum } from "@/i18n/i18n.ts";
import { h } from "vue";
import {
  DeleteOutlined,
  InfoCircleOutlined,
  LoginOutlined,
  LogoutOutlined
} from "@ant-design/icons-vue";
import { BookingStatus } from "@shared/enums/BookingStatus.ts";

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

export function getContextMenuItems(booking: BookingShort): ItemType[] {
  const items: ItemType[] = [
    {
      key: BookingContextMenuItem.INFO,
      label: translateEnum(BookingContextMenuItem, BookingContextMenuItem.INFO),
      icon: h(InfoCircleOutlined),
    },
  ];
  switch (booking.status) {
    case BookingStatus.ACTIVE:
      items.push({
        key: BookingContextMenuItem.CHECK_IN,
        label: translateEnum(BookingContextMenuItem, BookingContextMenuItem.CHECK_IN),
        icon: h(LoginOutlined),
      })
      break;
    case BookingStatus.CHECKED_IN:
      items.push(...[
        {
          key: BookingContextMenuItem.CANCEL_CHECK_IN,
          label: translateEnum(BookingContextMenuItem, BookingContextMenuItem.CANCEL_CHECK_IN),
          icon: h(LogoutOutlined),
        },
        {
          key: BookingContextMenuItem.CHECK_OUT,
          label: translateEnum(BookingContextMenuItem, BookingContextMenuItem.CHECK_OUT),
          icon: h(LogoutOutlined),
        }
      ])
      break;
    case BookingStatus.CHECKED_OUT:
      items.push({
        key: BookingContextMenuItem.CANCEL_CHECK_OUT,
        label: translateEnum(BookingContextMenuItem, BookingContextMenuItem.CANCEL_CHECK_OUT),
        icon: h(LogoutOutlined),
      })
      break;
    case BookingStatus.CANCELED:
      break;
    default:
  }
  items.push({
    key: BookingContextMenuItem.DELETE,
    label: translateEnum(BookingContextMenuItem, BookingContextMenuItem.DELETE),
    danger: true,
    icon: h(DeleteOutlined),
  })

  return items;
}
