import { registerEnum } from "@/i18n/enumRegistry";

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  EXTERNAL = 'EXTERNAL',
}

registerEnum(PaymentMethod, 'PaymentMethod');
