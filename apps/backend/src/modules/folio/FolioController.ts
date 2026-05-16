import { Elysia } from 'elysia'
import { FolioService } from "@/modules/folio/FolioService";
import { folioModel } from "@/modules/folio/FolioModel";
import { permissions } from "@/auth/permissions";
import { requirePermission } from "@/modules/auth/AuthGuard";

export const folioController = new Elysia({ prefix: '/folio', tags: ['Folio'] })
    .decorate('folioService', new FolioService())
    .post(
        '/',
        async ({ folioService, body }) => {
            return folioService.create(body);
        },
        { body: folioModel.create, beforeHandle: requirePermission(permissions.FOLIO_UPDATE) },
    )
    .post(
        '/deleteItems',
        async ({ folioService, body }) => {
            return folioService.deleteItems(body)
        },
        { body: folioModel.deleteItems, beforeHandle: requirePermission(permissions.FOLIO_UPDATE) },
    )
    .post(
        '/addTransaction',
        async ({ folioService, body }) => {
            return folioService.createTransaction(body);
        },
        { body: folioModel.addTransaction, beforeHandle: requirePermission(permissions.PAYMENT_CREATE) },
    )
    .guard({ params: folioModel.params })
    .get(
        '/:id',
        async ({ folioService, params: { id } }) => {
            return folioService.get(id);
        },
        { beforeHandle: requirePermission(permissions.FOLIO_READ) },
    )
    .post(
        '/:id/addItem',
        async ({ folioService, params: { id }, body }) => {
            return folioService.addItem(id, body);
        },
        { body: folioModel.addItem, beforeHandle: requirePermission(permissions.FOLIO_UPDATE) },
    )
    .delete(
        '/:id',
        async ({ folioService, params: { id } }) => {
            return folioService.delete(id);
        },
        { beforeHandle: requirePermission(permissions.FOLIO_UPDATE) },
    )
