import { Elysia } from 'elysia'

import { DocumentTypeService } from "@/modules/document-type/DocumentTypeService";
import { documentTypeModel } from "@/modules/document-type/DocumentTypeModel";
import { Permission } from "@shared/enums/Permission";
import { requirePermission } from "@/modules/auth/AuthGuard";


export const documentTypeController = new Elysia({ prefix: '/documentType', tags: ['DocumentType'] })
    .decorate('documentTypeService', new DocumentTypeService())
    .get(
        '/',
        async ({ documentTypeService }) => {
            return documentTypeService.getAll();
        },
        { beforeHandle: requirePermission(Permission.DOCUMENT_TYPE_READ) },
    )
    .post(
        '/',
        async ({ documentTypeService, body }) => {
            return documentTypeService.create(body);
        },
        { body: documentTypeModel.create, beforeHandle: requirePermission(Permission.DOCUMENT_TYPE_EDIT) },
    )
    .guard({ params: documentTypeModel.params })
    .get(
        '/:id',
        async ({ documentTypeService, params: { id } }) => {
            return documentTypeService.getById(id);
        },
        { beforeHandle: requirePermission(Permission.DOCUMENT_TYPE_READ) },
    )
    .put(
        '/:id',
        async ({ documentTypeService, params: { id }, body }) => {
            return documentTypeService.update(id, body);
        },
        { body: documentTypeModel.update, beforeHandle: requirePermission(Permission.DOCUMENT_TYPE_EDIT) },
    )
    .delete(
        '/:id',
        async ({ documentTypeService, params: { id } }) => {
            return documentTypeService.delete(id);
        },
        { beforeHandle: requirePermission(Permission.DOCUMENT_TYPE_EDIT) },
    )
