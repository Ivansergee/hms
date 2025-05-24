import { registerEnum } from "@/i18n/enumRegistry.ts";

export enum BookingPropertyForChange {
  START = 'start',
  END = 'end',
  ROOM = 'room',
}

registerEnum(BookingPropertyForChange, 'BookingPropertyForChange');
