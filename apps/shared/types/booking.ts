import type { BookingStatus } from "../enums/BookingStatus";
import type { BookingGuest, BookingGuestCreate, BookingGuestShort } from "./bookingGuest";
import type { Folio } from "./folio";

export interface BookingShort {
    id: number;
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    arrivalMinutes: number,
    departureMinutes: number,
    status: BookingStatus;
    guests: BookingGuestShort[];
}

export interface BookingDetails {
    id: number;
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    arrivalMinutes: number,
    departureMinutes: number,
    status: BookingStatus;
    guests: BookingGuest[];
    folios: Folio[];
}

export interface BookingCreate {
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    arrivalMinutes: number,
    departureMinutes: number,
    guests: BookingGuestCreate[];
    mainGuestIndex: number;
}

export interface BookingPlacement {
    checkInDate: string;
    checkOutDate: string;
    roomId: number;
}
