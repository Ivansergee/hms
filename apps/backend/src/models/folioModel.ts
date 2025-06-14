import { t } from 'elysia';
import { enumToTypebox } from "@/utils/enumUtils";
import { PaymentMethod } from "@shared/generated/enums";

const create = t.Object({
    bookingId: t.Number(),
});

const addItem = t.Object({
    serviceId: t.Number(),
    quantity: t.Number(),
    unitPrice: t.String({ pattern: '^\\d+(\\.\\d{1,2})?$' }),
    totalPrice: t.String({ pattern: '^\\d+(\\.\\d{1,2})?$' }),
    dateOfService: t.String({ format: 'date' }),
});

const deleteItems = t.Array(t.Number());

const addPayment = t.Object({
    method: t.Enum(enumToTypebox(PaymentMethod)),
    amount: t.String({ pattern: '^\\d+(\\.\\d{1,2})?$' }),
    folioItemIds: t.Array(t.Number()),
});

export const folioModel = {
    create,
    addItem,
    deleteItems,
    addPayment,
    params: t.Object({
        id: t.Numeric(),
    }),
};
