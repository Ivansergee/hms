import { Prisma } from "@prisma/client";

export const bookingDbQueries = {
    details: {
        include: {
            guests: true,
            mainGuest: { select: { id: true } },
            folios: {
                include: {
                    items: {
                        include: { payment: true },
                    },
                },
            },
        },
    },
};

export type BookingDetailsRaw = Prisma.BookingGetPayload<typeof bookingDbQueries.details>;
