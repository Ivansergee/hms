import { registerEnum } from "@/i18n/enumRegistry";

export enum BillingTabTableType {
  SERVICE = 'SERVICE',
  PAYMENT = 'PAYMENT',
  FOLIO = 'FOLIO',
}

registerEnum(BillingTabTableType, 'BillingTabTableType');
