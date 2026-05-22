import { Elysia } from 'elysia'

import { guestModel } from "@/modules/guest/GuestModel";
import { GuestService } from "@/modules/guest/GuestService";
import { Permission } from "@shared/enums/Permission";
import { requirePermission } from "@/modules/auth/AuthGuard";


export const guestController = new Elysia({ prefix: '/guest', tags: ['Guest'] })
    .decorate('guestService', new GuestService())
    .get(
        '/',
        async ({ guestService }) => {
            return guestService.getAll();
        },
        { beforeHandle: requirePermission(Permission.GUEST_READ) },
    )
    .post(
        '/',
        async ({ guestService, body }) => {
            return guestService.create(body);
        },
        { body: guestModel.create, beforeHandle: requirePermission(Permission.GUEST_EDIT) },
    )
    .guard({ params: guestModel.params })
    .get(
        '/:id',
        async ({ guestService, params: { id } }) => {
            return guestService.getById(id);
        },
        { beforeHandle: requirePermission(Permission.GUEST_READ) },
    )
    .put(
        '/:id',
        async ({ guestService, params: { id }, body }) => {
            return guestService.update(id, body);
        },
        { body: guestModel.update, beforeHandle: requirePermission(Permission.GUEST_EDIT) },
    )
    .delete(
        '/:id',
        async ({ guestService, params: { id } }) => {
            return guestService.delete(id);
        },
        { beforeHandle: requirePermission(Permission.GUEST_EDIT) },
    )
