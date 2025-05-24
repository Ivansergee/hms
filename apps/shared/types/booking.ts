import type { BookingStatus } from "../generated/enums";
import type { Guest, GuestCreate, GuestShort } from "./guest";

export interface BookingShort {
    id: number;
    roomId: number;
    start: string;
    end: string;
    status: BookingStatus;
    mainGuestId: number;
    guests: GuestShort[];
}

export interface BookingDetails {
    id: number;
    roomId: number;
    start: string;
    end: string;
    status: BookingStatus;
    mainGuestId: number;
    guests: Guest[];
}

export interface BookingCreate {
    roomId: number;
    start: string;
    end: string;
    guests: GuestCreate[];
}

export interface BookingEditPlacement {
    start: string;
    end: string;
    roomId: number;
}

export type BookingFormState = Partial<Omit<BookingDetails, 'id' | 'guests'>> & {
    id: number;
    guests: Partial<GuestCreate>[];
    currentStep?: number;
}
