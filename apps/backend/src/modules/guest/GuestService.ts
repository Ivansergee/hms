import type { Guest, Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/prisma";
import type { GuestCreateDTO, GuestUpdateDTO } from "@/modules/guest/GuestModel";
import { parseDateOnly } from "@/utils/dateUtils";

export class GuestService {
    getAll(): Promise<Guest[]> {
        return prisma.guest.findMany();
    }

    search(query?: string): Promise<Guest[]> {
        const q = query?.trim();

        if (!q) {
            return prisma.guest.findMany({
                take: 50,
                orderBy: [
                    { lastName: 'asc' },
                    { firstName: 'asc' },
                ],
            });
        }

        return prisma.guest.findMany({
            where: {
                OR: [
                    { firstName: { contains: q, mode: 'insensitive' } },
                    { lastName: { contains: q, mode: 'insensitive' } },
                    { parentName: { contains: q, mode: 'insensitive' } },
                    { phone: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                ],
            },
            take: 50,
            orderBy: [
                { lastName: 'asc' },
                { firstName: 'asc' },
            ],
        });
    }

    getById(id: number): Promise<Guest | null> {
        return prisma.guest.findUnique({ where: { id } });
    }

    create(data: GuestCreateDTO): Promise<Guest> {
        return prisma.guest.create({
            data: {
                ...data,
                birthdate: data.birthdate
                    ? parseDateOnly(data.birthdate)
                    : undefined,
            },
        });
    }

    update(id: number, data: GuestUpdateDTO): Promise<Guest> {
        return prisma.guest.update({
            where: { id },
            data: {
                ...data,
                birthdate: data.birthdate ? parseDateOnly(data.birthdate) : undefined,
            },
        });
    }

    delete(id: number): Promise<Guest> {
        return prisma.guest.delete({ where: { id } });
    }
}

export type GuestRaw = Prisma.GuestGetPayload<{}>;
