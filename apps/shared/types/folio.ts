import { PaymentMethod } from "../enums/PaymentMethod";
import { TransactionType } from "../enums/TransactionType";

export interface Folio {
    id: number;
    bookingId: number;
    items: FolioItem[];
    transactions: Transaction[];
    createdAt: string;
    updatedAt: string;
}

export interface FolioItem {
    id: number;
    serviceId: number;
    paymentId?: number;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    dateOfService: string;
    createdAt: number;
}

export type FolioItemCreate = Omit<FolioItem, 'id' | 'createdAt'>;

export interface Transaction {
    id: number;
    type: TransactionType;
    method: PaymentMethod;
    amount: string;
    createdAt: number;
}

export interface TransactionCreate {
    type: TransactionType;
    method: PaymentMethod;
    amount: string;
    folioItemIds: number[];
}
