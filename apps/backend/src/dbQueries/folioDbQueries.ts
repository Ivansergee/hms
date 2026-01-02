import { Prisma } from "@prisma/client";

export const folioDbQueries = {
    get: {
        include: {
            items: {
                include: {
                    transaction: true,
                }
            },
        },
    },
};

const itemQuery = { include: { transaction: true } };

export type FolioRaw = Prisma.FolioGetPayload<typeof folioDbQueries.get>;
export type FolioItemRaw = Prisma.FolioItemGetPayload<typeof itemQuery>;