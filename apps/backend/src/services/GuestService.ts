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
}
