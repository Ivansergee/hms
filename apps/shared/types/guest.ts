import { Gender } from "../enums/Gender";
import type { CountryCode } from "../constants/countryCodes";

export interface Guest {
    id: number;
    firstName: string;
    lastName: string;
    parentName?: string;
    gender?: Gender;
    birthdate?: string;
    phone?: string;
    email?: string;
    citizenship?: CountryCode;
    createdAt: string;
    updatedAt: string;
    identityDocumentId?: number;
}

export type GuestCreate = Omit<Guest, 'id' | 'createdAt' | 'updatedAt' | 'identityDocumentId'>;
