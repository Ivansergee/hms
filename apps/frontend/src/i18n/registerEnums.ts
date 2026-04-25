import { registerEnum } from './enumRegistry';
import { RoomStatus } from '@shared/enums/RoomStatus';
import { BillingTabTableType } from "@/enums/BillingTabTableType.ts";
import { BookingPropertyForChange } from "@/enums/BookingPropertyForChange.ts";
import { PaymentMethod } from "@/enums/PaymentMethod.ts";
import { BookingContextMenuItem } from "@/enums/BookingContextMenuItem.ts";

export function registerEnums() {
  registerEnum(RoomStatus, 'RoomStatus');
  registerEnum(BillingTabTableType, 'BillingTabTableType');
  registerEnum(BookingPropertyForChange, 'BookingPropertyForChange');
  registerEnum(PaymentMethod, 'PaymentMethod');
  registerEnum(BookingContextMenuItem, 'BookingContextMenuItem');
}
