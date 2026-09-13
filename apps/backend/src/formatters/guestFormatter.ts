import { GuestRaw } from "@/modules/guest/GuestService";
import { Guest } from "@shared/types/guest";
import { Gender } from "@shared/enums/Gender";
import { formatDate, formatDateTime } from "@/utils/dateUtils";
import { nullToUndefined } from "@/utils/formatUtils";
import { isCountryCode } from "@shared/validation/guest";

export const guestFormatter = {
    formatGuest(guestData: GuestRaw): Guest {
        const cleanData = nullToUndefined(guestData);
        return {
            ...cleanData,
            birthdate: cleanData.birthdate ? formatDate(cleanData.birthdate) : undefined,
            createdAt: formatDateTime(cleanData.createdAt),
            updatedAt: formatDateTime(cleanData.updatedAt),
            gender: cleanData.gender as Gender,
            citizenship: cleanData.citizenship && isCountryCode(cleanData.citizenship)
                ? cleanData.citizenship
                : undefined,
        };
    }
};
