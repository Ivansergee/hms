import type { Gender } from "../enums/Gender";
import type { BookingGuestRole } from "../enums/BookingGuestRole";
import type { GuestCreate } from "./guest";
import type { CountryCode } from "../constants/countryCodes";

export interface BookingGuest {
    id: number;
    bookingId: number;
    guestId?: number;
    role: BookingGuestRole;
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
}

export interface BookingGuestShort {
    id: number;
    guestId?: number;
    role: BookingGuestRole;
    firstName: string;
    lastName: string;
}

export type BookingGuestCreate = GuestCreate & {
    guestId?: number;
};

export type BookingGuestSnapshotCreate = Omit<BookingGuestCreate, 'guestId'>;

export interface BookingGuestLinkExisting {
    guestId: number;
}

export interface BookingGuestSnapshotUpdate {
    firstName?: string;
    lastName?: string;
    parentName?: string | null;
    gender?: Gender | null;
    birthdate?: string | null;
    phone?: string | null;
    email?: string | null;
    citizenship?: CountryCode | null;
}
