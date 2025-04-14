import { Elysia } from 'elysia'

import { IdentityDocumentService } from "@/services/IdentityDocumentService";
import { identityDocumentModel } from "@/models/identityDocumentModel";


export const identityDocument = new Elysia({ prefix: '/identityDocument', tags: ['IdentityDocument'] })
    .decorate('identityDocumentService', new IdentityDocumentService())
    .get(
        '/',
        async ({ identityDocumentService }) => {
            return identityDocumentService.getAll();
        },
    )
    .post(
        '/',
        async ({ identityDocumentService, body }) => {
            return identityDocumentService.create(body);
        },
        { body: identityDocumentModel.create },
    )
    .guard({ params: identityDocumentModel.params })
    .get(
        '/:id',
        async ({ identityDocumentService, params: { id }, error }) => {
            return identityDocumentService.getById(id);
        },
    )
    .put(
        '/:id',
        async ({ identityDocumentService, params: { id }, body, error }) => {
            return identityDocumentService.update(id, body);
        },
        { body: identityDocumentModel.update },
    )
    .delete(
        '/:id',
        async ({ identityDocumentService, params: { id }, error }) => {
            return identityDocumentService.delete(id);
        },
    )
