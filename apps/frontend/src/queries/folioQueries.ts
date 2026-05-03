import fetcher from '@/queries/fetcher';
import type {
  Folio,
  FolioItem,
  FolioItemCreate,
  Transaction,
  TransactionCreate,
} from '@shared/types/folio';

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

  addTransaction(txData: TransactionCreate): Promise<Transaction> {
    return fetcher.post<Transaction>('/folio/addTransaction', txData);
  },
};
