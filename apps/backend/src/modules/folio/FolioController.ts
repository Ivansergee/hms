import { Elysia } from 'elysia'
import { FolioService } from "@/modules/folio/FolioService";
import { folioModel } from "@/modules/folio/FolioModel";
import { Permission } from "@shared/enums/Permission";
import { requirePermission } from "@/modules/auth/AuthGuard";

export const folioController = new Elysia({ prefix: '/folio', tags: ['Folio'] })
    .decorate('folioService', new FolioService())
    .post(
        '/',
        async ({ folioService, body }) => {
            return folioService.create(body);
        },
        { body: folioModel.create, beforeHandle: requirePermission(Permission.FOLIO_EDIT) },
    )
    .post(
        '/deleteItems',
        async ({ folioService, body }) => {
            return folioService.deleteItems(body)
        },
        { body: folioModel.deleteItems, beforeHandle: requirePermission(Permission.FOLIO_EDIT) },
    )
    .post(
        '/addTransaction',
        async ({ folioService, body }) => {
            return folioService.createTransaction(body);
        },
        { body: folioModel.addTransaction, beforeHandle: requirePermission(Permission.FOLIO_EDIT) },
    )
    .guard({ params: folioModel.params })
    .get(
        '/:id',
        async ({ folioService, params: { id } }) => {
            return folioService.get(id);
        },
        { beforeHandle: requirePermission(Permission.FOLIO_READ) },
    )
    .post(
        '/:id/addItem',
        async ({ folioService, params: { id }, body }) => {
            return folioService.addItem(id, body);
        },
        { body: folioModel.addItem, beforeHandle: requirePermission(Permission.FOLIO_EDIT) },
    )
    .delete(
        '/:id',
        async ({ folioService, params: { id } }) => {
            return folioService.delete(id);
        },
        { beforeHandle: requirePermission(Permission.FOLIO_EDIT) },
    )
