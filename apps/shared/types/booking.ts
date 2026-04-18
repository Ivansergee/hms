import type { BookingStatus } from "../enums/BookingStatus";
import type { Guest, GuestInput, GuestShort } from "./guest";
import type { Folio } from "./folio";

export interface BookingShort {
    id: number;
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    arrivalMinutes: number,
    departureMinutes: number,
    status: BookingStatus;
    mainGuestId: number;
    guests: GuestShort[];
}

export interface BookingDetails {
    id: number;
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    arrivalMinutes: number,
    departureMinutes: number,
    status: BookingStatus;
    mainGuestId: number;
    guests: Guest[];
    folios: Folio[];
}

export interface BookingCreate {
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    arrivalMinutes: number,
    departureMinutes: number,
    guests: GuestInput[];
    mainGuestIndex: number;
}

export interface BookingPlacement {
    checkInDate: string;
    checkOutDate: string;
    roomId: number;
}
