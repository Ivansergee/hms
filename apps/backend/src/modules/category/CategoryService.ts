import type { Category, Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/prisma";

export class CategoryService {
    getAll(): Promise<Category[]> {
        return prisma.category.findMany();
    }

    getById(id: number): Promise<Category | null> {
        return prisma.category.findUnique({ where: { id } });
    }

    create(data: Prisma.CategoryCreateInput): Promise<Category> {
        return prisma.category.create({ data });
    }

    update(id: number, data: Prisma.CategoryUpdateInput): Promise<Category> {
        return prisma.category.update({ where: { id }, data });
    }

    delete(id: number): Promise<Category> {
        return prisma.category.delete({ where: { id } });
    }
}
