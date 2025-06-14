import fetcher from "@/queries/fetcher.ts";
import type {
  Folio,
  FolioItem,
  FolioItemCreate,
  Payment,
  PaymentCreate
} from "@shared/types/folio.ts";

export const folioQueries = {
  getById(id: number): Promise<Folio> {
    return fetcher.get<Folio>(`/folio/${id}`);
  },

  addItem(id: number, itemData: FolioItemCreate): Promise<FolioItem> {
    return fetcher.post<FolioItem>(`/folio/${id}/addItem`, itemData);
  },

  deleteItems(itemIds: number[]): Promise<{ count: number }> {
    return fetcher.post<{ count: number }>('/folio/deleteItems', itemIds);
  },

  addPayment(paymentData: PaymentCreate): Promise<Payment> {
    return fetcher.post<Payment>(`/folio/addPayment`, paymentData);
  },
};
