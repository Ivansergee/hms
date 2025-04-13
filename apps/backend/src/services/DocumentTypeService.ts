import type { DocumentType, Prisma } from "@prisma/client";
import { prisma } from "../../prisma/prisma";
import { BaseService } from "./BaseService";

export class DocumentTypeService extends BaseService<
    DocumentType,
    Prisma.DocumentTypeCreateInput,
    Prisma.DocumentTypeUpdateInput
> {
    constructor() {
        super(prisma.documentType);
    }
}

