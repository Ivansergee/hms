import { Gender } from "../generated/enums";

export interface Guest {
    id: number;
    firstName: string;
    lastName: string;
    parentName?: string;
    gender?: Gender;
    birthdate?: string;
    phone?: string;
    email?: string;
    citizenship?: string;
    createdAt: string;
    updatedAt: string;
    identityDocumentId?: number;
}

export interface GuestShort {
    id: number;
    firstName: string;
    lastName: string;
}

export type GuestCreate = Omit<Guest, 'id' | 'createdAt' | 'updatedAt'> & { id?: number };
