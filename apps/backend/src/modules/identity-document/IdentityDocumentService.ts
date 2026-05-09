import type { IdentityDocument } from "@prisma/client";
import { prisma } from "../../../prisma/prisma";
import { IdentityDocumentCreateDTO, IdentityDocumentUpdateDTO } from "@/modules/identity-document/IdentityDocumentModel";

export class IdentityDocumentService {
    getAll(): Promise<IdentityDocument[]> {
        return prisma.identityDocument.findMany();
    }

    getById(id: number): Promise<IdentityDocument | null> {
        return prisma.identityDocument.findUnique({ where: { id } });
    }

    create(data: IdentityDocumentCreateDTO): Promise<IdentityDocument> {
        return prisma.identityDocument.create({ data });
    }

    update(id: number, data: IdentityDocumentUpdateDTO): Promise<IdentityDocument> {
        return prisma.identityDocument.update({ where: { id }, data });
    }

    delete(id: number): Promise<IdentityDocument> {
        return prisma.identityDocument.delete({ where: { id } });
    }
}
