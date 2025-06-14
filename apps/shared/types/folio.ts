import { PaymentMethod } from "../generated/enums";

export interface Folio {
    id: number;
    bookingId: number;
    items: FolioItem[];
    payments: Payment[];
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

export interface Payment {
    id: number;
    method: PaymentMethod;
    amount: string;
    createdAt: number;
}

export interface PaymentCreate {
    method: PaymentMethod;
    amount: string;
    folioItemIds: number[];
}
