import type { BookingStatus } from "../generated/enums";
import { type Guest, type GuestCreate } from "./guest";

export interface Booking {
    id: number;
    roomId: number;
    start: string;
    end: string;
    guestId: number;
    status: BookingStatus;
    mainGuest: {
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    updatedAt: string;
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

export type BookingFormState = Partial<Omit<BookingDetails, 'id' | 'guests'>> & {
    id: number;
    guests: Partial<GuestCreate>[];
    currentStep?: number;
}
