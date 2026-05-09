import { Elysia } from 'elysia'

import { DocumentTypeService } from "@/modules/document-type/DocumentTypeService";
import { documentTypeModel } from "@/modules/document-type/DocumentTypeModel";


export const documentTypeController = new Elysia({ prefix: '/documentType', tags: ['DocumentType'] })
    .decorate('documentTypeService', new DocumentTypeService())
    .get(
        '/',
        async ({ documentTypeService }) => {
            return documentTypeService.getAll();
        },
    )
    .post(
        '/',
        async ({ documentTypeService, body }) => {
            return documentTypeService.create(body);
        },
        { body: documentTypeModel.create },
    )
    .guard({ params: documentTypeModel.params })
    .get(
        '/:id',
        async ({ documentTypeService, params: { id }, error }) => {
            return documentTypeService.getById(id);
        },
    )
    .put(
        '/:id',
        async ({ documentTypeService, params: { id }, body, error }) => {
            return documentTypeService.update(id, body);
        },
        { body: documentTypeModel.update },
    )
    .delete(
        '/:id',
        async ({ documentTypeService, params: { id }, error }) => {
            return documentTypeService.delete(id);
        },
    )
