import type { FolioItem, Transaction } from "@shared/types/folio.ts";

export enum FolioItemType {
  SERVICE = 'service',
  TRANSACTION = 'transaction',
}

export interface FolioServiceRecord extends FolioItem {
  itemType: FolioItemType.SERVICE;
}

export interface FolioTransactionRecord extends Transaction {
  itemType: FolioItemType.TRANSACTION;
}

export type FolioTableRecord =  FolioServiceRecord | FolioTransactionRecord;
