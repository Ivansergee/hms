import { Elysia } from 'elysia'
import { FolioService } from "@/modules/folio/FolioService";
import { folioModel } from "@/modules/folio/FolioModel";

export const folioController = new Elysia({ prefix: '/folio', tags: ['Folio'] })
    .decorate('folioService', new FolioService())
    .post(
        '/',
        async ({ folioService, body }) => {
            return folioService.create(body);
        },
        { body: folioModel.create },
    )
    .post(
        '/deleteItems',
        async ({ folioService, body }) => {
            return folioService.deleteItems(body)
        },
        { body: folioModel.deleteItems },
    )
    .post(
        '/addTransaction',
        async ({ folioService, body }) => {
            return folioService.createTransaction(body);
        },
        { body: folioModel.addTransaction },
    )
    .guard({ params: folioModel.params })
    .get(
        '/:id',
        async ({ folioService, params: { id } }) => {
            return folioService.get(id);
        },
    )
    .post(
        '/:id/addItem',
        async ({ folioService, params: { id }, body }) => {
            return folioService.addItem(id, body);
        },
        { body: folioModel.addItem },
    )
    .delete(
        '/:id',
        async ({ folioService, params: { id } }) => {
            return folioService.delete(id);
        },
    )

