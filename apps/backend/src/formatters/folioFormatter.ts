import { formatDate } from "@/utils/dateUtils";
import { Folio, FolioItem, Transaction } from "@shared/types/folio";
import { FolioItemRaw, FolioRaw } from "@/dbQueries/folioDbQueries";
import { PaymentMethod } from "@shared/enums/PaymentMethod";
import { TransactionType } from "@shared/enums/TransactionType";

function getTransactionsFromItems(items: FolioItemRaw[]): Transaction[] {
    const paymentById = new Map<number, Transaction>();
    items.forEach((item) => {
        if (item.transactionId && item.transaction && !paymentById.has(item.transactionId)) {
            paymentById.set(
                item.transactionId,
                {
                    id: item.transaction.id,
                    type: item.transaction.type as TransactionType,
                    method: item.transaction.method as PaymentMethod,
                    amount: item.transaction.amount.toFixed(2),
                    createdAt: item.transaction.createdAt.getTime(),
                },
            );
        }
    });
    return Array.from(paymentById.values());
}

function formatFolio(folioData: FolioRaw): Folio {
    return {
        ...folioData,
        createdAt: formatDate(folioData.createdAt),
        updatedAt: formatDate(folioData.updatedAt),
        items: folioData.items.map(folioItem => formatFolioItem(folioItem)),
        transactions: getTransactionsFromItems(folioData.items),
    };
}

function formatFolioItem(item: FolioItemRaw): FolioItem {
    return {
        id: item.id,
        serviceId: item.serviceId,
        paymentId: item.transactionId ?? undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        totalPrice: item.totalPrice.toFixed(2),
        dateOfService: formatDate(item.dateOfService),
        createdAt: item.createdAt.getTime(),
    };
}

export const folioFormatter = {
    formatFolio,
    formatFolioItem,
};
