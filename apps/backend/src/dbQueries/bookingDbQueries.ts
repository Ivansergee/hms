import { Prisma } from "@prisma/client";

export const bookingDbQueries = {
    details: {
        include: {
            guests: true,
            folios: {
                include: {
                    items: {
                        include: { transaction: true },
                    },
                },
            },
        },
    },
};

export type BookingDetailsRaw = Prisma.BookingGetPayload<typeof bookingDbQueries.details>;
