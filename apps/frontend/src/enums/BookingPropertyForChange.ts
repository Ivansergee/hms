import { registerEnum } from "@/i18n/enumRegistry";

export enum BookingPropertyForChange {
  START = 'start',
  END = 'end',
  ROOM = 'room',
}

registerEnum(BookingPropertyForChange, 'BookingPropertyForChange');
