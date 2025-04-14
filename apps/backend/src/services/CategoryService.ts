import type { Category, Prisma } from "@prisma/client";
import { prisma } from "@/../prisma/prisma";
import { BaseService } from "@/services/BaseService";


export class CategoryService extends BaseService<
    Category,
    Prisma.CategoryCreateInput,
    Prisma.CategoryUpdateInput
> {
    constructor() {
        super(prisma.category);
    }
}
