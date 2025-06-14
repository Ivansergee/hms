import { GuestRaw } from "@/services/GuestService";
import { Guest } from "@shared/types/guest";
import { Gender } from "@shared/generated/enums";
import { formatDate } from "@/utils/dateUtils";
import { nullToUndefined } from "@/utils/formatUtils";

export const guestFormatter = {
    formatGuest(guestData: GuestRaw): Guest {
        const cleanData = nullToUndefined(guestData);
        return {
            ...cleanData,
            birthdate: cleanData.birthdate ? formatDate(cleanData.birthdate) : undefined,
            createdAt: formatDate(cleanData.createdAt),
            updatedAt: formatDate(cleanData.updatedAt),
            gender: cleanData.gender as Gender,
        };
    }
};
