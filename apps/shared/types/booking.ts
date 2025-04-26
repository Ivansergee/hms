import type { BookingStatus } from "../generated/enums";
import { type Guest } from "./guest";

export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export interface Booking {
    id: number;
    roomId: number;
    start: string;
    end: string;
    guestId: number;
    status: BookingStatus;
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

export type PartialBookingDetails = PartialExcept<BookingDetails, 'id'>;