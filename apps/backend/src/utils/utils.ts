import {  GuestInput } from "@shared/types/guest";

export const isExistingGuest = (guest: GuestInput): guest is { id: number } => {
    return 'id' in guest && !!guest.id;
};
