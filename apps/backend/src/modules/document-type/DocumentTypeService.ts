import type { DocumentType, Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/prisma";

export class DocumentTypeService {
    getAll(): Promise<DocumentType[]> {
        return prisma.documentType.findMany();
    }

    getById(id: number): Promise<DocumentType | null> {
        return prisma.documentType.findUnique({ where: { id } });
    }

    create(data: Prisma.DocumentTypeCreateInput): Promise<DocumentType> {
        return prisma.documentType.create({ data });
    }

    update(id: number, data: Prisma.DocumentTypeUpdateInput): Promise<DocumentType> {
        return prisma.documentType.update({ where: { id }, data });
    }

    delete(id: number): Promise<DocumentType> {
        return prisma.documentType.delete({ where: { id } });
    }
}
