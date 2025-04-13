export interface IdentityDocumentCreatePayload {
    typeId: number,
    firstName: string,
    lastName: string,
    parentName?: string,
    birthdate: string,
    number: string,
    issuedBy?: string,
    issuedByCode?: string,
    issuedAt?: string,
    expiresAt?: string,
}

export type IdentityDocumentUpdatePayload = Partial<IdentityDocumentCreatePayload>;
