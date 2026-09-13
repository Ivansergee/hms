import type { BookingGuest as BookingGuestRaw } from "@prisma/client";
import type { BookingGuest, BookingGuestShort } from "@shared/types/bookingGuest";
import { BookingGuestRole } from "@shared/enums/BookingGuestRole";
import { Gender } from "@shared/enums/Gender";
import { formatDate, formatDateTime } from "@/utils/dateUtils";
import { nullToUndefined } from "@/utils/formatUtils";
import { isCountryCode } from "@shared/validation/guest";

function formatBookingGuest(guestData: BookingGuestRaw): BookingGuest {
    const cleanData = nullToUndefined(guestData);

    return {
        ...cleanData,
        birthdate: cleanData.birthdate ? formatDate(cleanData.birthdate) : undefined,
        createdAt: formatDateTime(cleanData.createdAt),
        updatedAt: formatDateTime(cleanData.updatedAt),
        role: cleanData.role as BookingGuestRole,
        gender: cleanData.gender as Gender | undefined,
        citizenship: cleanData.citizenship && isCountryCode(cleanData.citizenship)
            ? cleanData.citizenship
            : undefined,
    };
}

function formatBookingGuestShort(guestData: Pick<BookingGuestRaw, 'id' | 'guestId' | 'role' | 'firstName' | 'lastName'>): BookingGuestShort {
    const cleanData = nullToUndefined(guestData);

    return {
        ...cleanData,
        role: cleanData.role as BookingGuestRole,
    };
}

export const bookingGuestFormatter = {
    formatBookingGuest,
    formatBookingGuestShort,
};
