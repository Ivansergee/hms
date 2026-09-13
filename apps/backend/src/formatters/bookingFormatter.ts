import { BookingDetails } from "@shared/types/booking";
import type { BookingDetailsRaw } from "@/dbQueries/bookingDbQueries";
import { formatDate } from "@/utils/dateUtils";
import { BookingStatus } from "@shared/enums/BookingStatus";
import { bookingGuestFormatter } from "@/formatters/bookingGuestFormatter";
import { folioFormatter } from "@/formatters/folioFormatter";

function formatDetails(bookingData: BookingDetailsRaw): BookingDetails {
    return {
        id: bookingData.id,
        roomId: bookingData.roomId,
        checkInDate: formatDate(bookingData.checkInDate),
        checkOutDate: formatDate(bookingData.checkOutDate),
        arrivalMinutes: bookingData.arrivalMinutes,
        departureMinutes: bookingData.departureMinutes,
        status: bookingData.status as BookingStatus,
        guests: bookingData.guests.map(guestData => bookingGuestFormatter.formatBookingGuest(guestData)),
        folios: bookingData.folios.map(folio => folioFormatter.formatFolio(folio)),
    };
}

export const bookingFormatter = {
    formatDetails,
};