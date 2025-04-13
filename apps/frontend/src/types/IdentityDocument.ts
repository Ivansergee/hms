export interface IdentityDocument {
  id: string;
  guestId: number;
  type: DocumentType;
  number: string;
  issuedBy?: string;
  issuedByCode?: string;
  issuedAt: string;
  expiresAt?: string;
}
