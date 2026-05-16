import { Elysia } from 'elysia'

import { guestModel } from "@/modules/guest/GuestModel";
import { GuestService } from "@/modules/guest/GuestService";
import { permissions } from "@/auth/permissions";
import { requirePermission } from "@/modules/auth/AuthGuard";


export const guestController = new Elysia({ prefix: '/guest', tags: ['Guest'] })
    .decorate('guestService', new GuestService())
    .get(
        '/',
        async ({ guestService }) => {
            return guestService.getAll();
        },
        { beforeHandle: requirePermission(permissions.GUEST_READ) },
    )
    .post(
        '/',
        async ({ guestService, body }) => {
            return guestService.create(body);
        },
        { body: guestModel.create, beforeHandle: requirePermission(permissions.GUEST_CREATE) },
    )
    .guard({ params: guestModel.params })
    .get(
        '/:id',
        async ({ guestService, params: { id } }) => {
            return guestService.getById(id);
        },
        { beforeHandle: requirePermission(permissions.GUEST_READ) },
    )
    .put(
        '/:id',
        async ({ guestService, params: { id }, body }) => {
            return guestService.update(id, body);
        },
        { body: guestModel.update, beforeHandle: requirePermission(permissions.GUEST_UPDATE) },
    )
    .delete(
        '/:id',
        async ({ guestService, params: { id } }) => {
            return guestService.delete(id);
        },
        { beforeHandle: requirePermission(permissions.GUEST_DELETE) },
    )
