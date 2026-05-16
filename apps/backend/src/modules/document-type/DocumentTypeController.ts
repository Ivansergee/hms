import { Elysia } from 'elysia'

import { DocumentTypeService } from "@/modules/document-type/DocumentTypeService";
import { documentTypeModel } from "@/modules/document-type/DocumentTypeModel";
import { permissions } from "@/auth/permissions";
import { requirePermission } from "@/modules/auth/AuthGuard";


export const documentTypeController = new Elysia({ prefix: '/documentType', tags: ['DocumentType'] })
    .decorate('documentTypeService', new DocumentTypeService())
    .get(
        '/',
        async ({ documentTypeService }) => {
            return documentTypeService.getAll();
        },
        { beforeHandle: requirePermission(permissions.DOCUMENT_TYPE_READ) },
    )
    .post(
        '/',
        async ({ documentTypeService, body }) => {
            return documentTypeService.create(body);
        },
        { body: documentTypeModel.create, beforeHandle: requirePermission(permissions.DOCUMENT_TYPE_MANAGE) },
    )
    .guard({ params: documentTypeModel.params })
    .get(
        '/:id',
        async ({ documentTypeService, params: { id } }) => {
            return documentTypeService.getById(id);
        },
        { beforeHandle: requirePermission(permissions.DOCUMENT_TYPE_READ) },
    )
    .put(
        '/:id',
        async ({ documentTypeService, params: { id }, body }) => {
            return documentTypeService.update(id, body);
        },
        { body: documentTypeModel.update, beforeHandle: requirePermission(permissions.DOCUMENT_TYPE_MANAGE) },
    )
    .delete(
        '/:id',
        async ({ documentTypeService, params: { id } }) => {
            return documentTypeService.delete(id);
        },
        { beforeHandle: requirePermission(permissions.DOCUMENT_TYPE_MANAGE) },
    )
