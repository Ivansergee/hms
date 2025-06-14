import { prisma } from "@/../prisma/prisma";
import { Folio, FolioItem, FolioItemCreate, Payment, PaymentCreate } from "@shared/types/folio";
import { folioDbQueries } from "@/dbQueries/folioDbQueries";
import { folioFormatter } from "@/formatters/folioFormatter";

export class FolioService {
    async get(folioId: number): Promise<Folio> {
        const folioRaw = await prisma.folio.findFirst({
            where: { id: folioId },
            ...folioDbQueries.get,
        });

        if (!folioRaw) {
            throw new Error('Folio not found.');
        }

        return folioFormatter.formatFolio(folioRaw);
    }

    create(data: { bookingId: number }) {
        return prisma.folio.create({ data });
    }

    delete(folioId: number) {
        return prisma.folio.delete({where: { id: folioId }});
    }

    addItem(folioId: number, data: FolioItemCreate) {
        return prisma.folioItem.create({
            data: { folioId, ...data },
        });
    }

    deleteItems(itemIds: number[]) {
        return prisma.folioItem.deleteMany({
            where: {
                id: { in: itemIds },
            }
        });
    }

    addPayment(data: PaymentCreate) {
        return prisma.payment.create({
            data: {
                method: data.method,
                amount: data.amount,
                items: {
                    connect: data.folioItemIds.map((id) => ({ id }) ),
                },
            },
        });
    }
}
