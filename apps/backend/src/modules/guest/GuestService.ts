import type { Guest, Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/prisma";

export class GuestService {
    getAll(): Promise<Guest[]> {
        return prisma.guest.findMany();
    }

    getById(id: number): Promise<Guest | null> {
        return prisma.guest.findUnique({ where: { id } });
    }

    create(data: Prisma.GuestCreateInput): Promise<Guest> {
        return prisma.guest.create({
            data: {
                ...data,
                birthdate: data.birthdate
                    ? new Date(data.birthdate + 'T00:00:00')
                    : undefined,
            },
        });
    }

    update(id: number, data: Prisma.GuestUpdateInput): Promise<Guest> {
        return prisma.guest.update({ where: { id }, data });
    }

    delete(id: number): Promise<Guest> {
        return prisma.guest.delete({ where: { id } });
    }
}

export type GuestRaw = Prisma.GuestGetPayload<{}>;
