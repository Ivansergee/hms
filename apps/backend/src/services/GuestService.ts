import type { Guest, Prisma } from "@prisma/client";
import { prisma } from "@/../prisma/prisma";
import { BaseService } from "@/services/BaseService";

export class GuestService extends BaseService<
    Guest,
    Prisma.GuestCreateInput,
    Prisma.GuestUpdateInput
> {
    constructor() {
        super(prisma.guest);
    }
    create(data: Prisma.GuestCreateInput): Promise<Guest> {
        return super.create({
            ...data,
            birthdate: data.birthdate
                ? new Date(data.birthdate + 'T00:00:00')
                : undefined,
        });
    }
}

export type GuestRaw = Prisma.GuestGetPayload<{}>;
