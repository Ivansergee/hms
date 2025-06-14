import { BookingDetails } from "@shared/types/booking";
import type { BookingDetailsRaw } from "@/dbQueries/bookingDbQueries";
import { formatDate } from "@/utils/dateUtils";
import { BookingStatus } from "@shared/generated/enums";
import { guestFormatter } from "@/formatters/guestFormatter";
import { folioFormatter } from "@/formatters/folioFormatter";

function formatDetails(bookingData: BookingDetailsRaw): BookingDetails {
    return {
        id: bookingData.id,
        roomId: bookingData.roomId,
        start: formatDate(bookingData.start),
        end: formatDate(bookingData.end),
        status: bookingData.status as BookingStatus,
        mainGuestId: bookingData.mainGuest.id,
        guests: bookingData.guests.map(guestData => guestFormatter.formatGuest(guestData)),
        folios: bookingData.folios.map(folio => folioFormatter.formatFolio(folio)),
    };
}

export const bookingFormatter = {
    formatDetails,
};