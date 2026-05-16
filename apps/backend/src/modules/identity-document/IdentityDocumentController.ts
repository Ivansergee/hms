import { Elysia } from 'elysia'

import { IdentityDocumentService } from "@/modules/identity-document/IdentityDocumentService";
import { identityDocumentModel } from "@/modules/identity-document/IdentityDocumentModel";
import { permissions } from "@/auth/permissions";
import { requirePermission } from "@/modules/auth/AuthGuard";


export const identityDocumentController = new Elysia({ prefix: '/identityDocument', tags: ['IdentityDocument'] })
    .decorate('identityDocumentService', new IdentityDocumentService())
    .get(
        '/',
        async ({ identityDocumentService }) => {
            return identityDocumentService.getAll();
        },
        { beforeHandle: requirePermission(permissions.IDENTITY_DOCUMENT_READ) },
    )
    .post(
        '/',
        async ({ identityDocumentService, body }) => {
            return identityDocumentService.create(body);
        },
        { body: identityDocumentModel.create, beforeHandle: requirePermission(permissions.IDENTITY_DOCUMENT_MANAGE) },
    )
    .guard({ params: identityDocumentModel.params })
    .get(
        '/:id',
        async ({ identityDocumentService, params: { id } }) => {
            return identityDocumentService.getById(id);
        },
        { beforeHandle: requirePermission(permissions.IDENTITY_DOCUMENT_READ) },
    )
    .put(
        '/:id',
        async ({ identityDocumentService, params: { id }, body }) => {
            return identityDocumentService.update(id, body);
        },
        { body: identityDocumentModel.update, beforeHandle: requirePermission(permissions.IDENTITY_DOCUMENT_MANAGE) },
    )
    .delete(
        '/:id',
        async ({ identityDocumentService, params: { id } }) => {
            return identityDocumentService.delete(id);
        },
        { beforeHandle: requirePermission(permissions.IDENTITY_DOCUMENT_MANAGE) },
    )
