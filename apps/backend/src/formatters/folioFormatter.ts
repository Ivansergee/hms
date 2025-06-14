import { formatDate } from "@/utils/dateUtils";
import { Folio, FolioItem, Payment } from "@shared/types/folio";
import { FolioItemRaw, FolioRaw } from "@/dbQueries/folioDbQueries";
import { PaymentMethod } from "@shared/generated/enums";

function getPaymentsFromItems(items: FolioItemRaw[]): Payment[] {
    const paymentById = new Map<number, Payment>();
    items.forEach((item) => {
        if (item.paymentId && item.payment && !paymentById.has(item.paymentId)) {
            paymentById.set(
                item.paymentId,
                {
                    id: item.payment.id,
                    method: item.payment.method as PaymentMethod,
                    amount: item.payment.amount.toFixed(2),
                    createdAt: item.payment.createdAt.getTime(),
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
        payments: getPaymentsFromItems(folioData.items),
    };
}

function formatFolioItem(item: FolioItemRaw): FolioItem {
    return {
        id: item.id,
        serviceId: item.serviceId,
        paymentId: item.paymentId ?? undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        totalPrice: item.totalPrice.toFixed(2),
        dateOfService: formatDate(item.dateOfService, false),
        createdAt: item.createdAt.getTime(),
    };
}

export const folioFormatter = {
    formatFolio,
    formatFolioItem,
};
