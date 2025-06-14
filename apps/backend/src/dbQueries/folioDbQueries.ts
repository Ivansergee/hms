import { Prisma } from "@prisma/client";

export const folioDbQueries = {
    get: {
        include: {
            items: {
                include: {
                    payment: true,
                }
            },
        },
    },
};

const itemQuery = { include: { payment: true } };

export type FolioRaw = Prisma.FolioGetPayload<typeof folioDbQueries.get>;
export type FolioItemRaw = Prisma.FolioItemGetPayload<typeof itemQuery>;