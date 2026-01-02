import { t } from 'elysia';
import { enumToTypebox } from "@/utils/enumUtils";
import { PaymentMethod } from "@shared/enums/PaymentMethod";
import { TransactionType } from "@shared/enums/TransactionType";

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

const addTransaction = t.Object({
    method: t.Enum(enumToTypebox(PaymentMethod)),
    type: t.Enum(enumToTypebox(TransactionType)),
    amount: t.String({ pattern: '^\\d+(\\.\\d{1,2})?$' }),
    folioItemIds: t.Array(t.Number()),
});

export const folioModel = {
    create,
    addItem,
    deleteItems,
    addTransaction,
    params: t.Object({
        id: t.Numeric(),
    }),
};
