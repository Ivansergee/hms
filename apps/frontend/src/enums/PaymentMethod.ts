import { registerEnum } from "@/i18n/enumRegistry.ts";

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  EXTERNAL = 'EXTERNAL',
}

registerEnum(PaymentMethod, 'PaymentMethod');
