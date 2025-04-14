import type { IdentityDocument } from "@prisma/client";
import { prisma } from "@/../prisma/prisma";
import { BaseService } from "@/services/BaseService";
import { IdentityDocumentCreateDTO, IdentityDocumentUpdateDTO } from "@/models/identityDocumentModel";

export class IdentityDocumentService extends BaseService<
    IdentityDocument,
    IdentityDocumentCreateDTO,
    IdentityDocumentUpdateDTO
> {
    constructor() {
        super(prisma.identityDocument);
    }
}
