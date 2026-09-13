import { Elysia } from 'elysia'

import { guestModel } from "@/modules/guest/GuestModel";
import { GuestService } from "@/modules/guest/GuestService";
import { Permission } from "@shared/enums/Permission";
import { requirePermission } from "@/modules/auth/AuthGuard";
import { guestFormatter } from "@/formatters/guestFormatter";


export const guestController = new Elysia({ prefix: '/guest', tags: ['Guest'] })
    .decorate('guestService', new GuestService())
    .get(
        '/',
        async ({ guestService }) => {
            const guests = await guestService.getAll();
            return guests.map(guest => guestFormatter.formatGuest(guest));
        },
        { beforeHandle: requirePermission(Permission.GUEST_READ) },
    )
    .get(
        '/search',
        async ({ guestService, query }) => {
            const guests = await guestService.search(query.q);
            return guests.map(guest => guestFormatter.formatGuest(guest));
        },
        { query: guestModel.search, beforeHandle: requirePermission(Permission.GUEST_READ) },
    )
    .post(
        '/',
        async ({ guestService, body }) => {
            const guest = await guestService.create(body);
            return guestFormatter.formatGuest(guest);
        },
        { body: guestModel.create, beforeHandle: requirePermission(Permission.GUEST_EDIT) },
    )
    .guard({ params: guestModel.params })
    .get(
        '/:id',
        async ({ guestService, params: { id } }) => {
            const guest = await guestService.getById(id);
            return guest ? guestFormatter.formatGuest(guest) : null;
        },
        { beforeHandle: requirePermission(Permission.GUEST_READ) },
    )
    .put(
        '/:id',
        async ({ guestService, params: { id }, body }) => {
            const guest = await guestService.update(id, body);
            return guestFormatter.formatGuest(guest);
        },
        { body: guestModel.update, beforeHandle: requirePermission(Permission.GUEST_EDIT) },
    )
    .delete(
        '/:id',
        async ({ guestService, params: { id } }) => {
            const guest = await guestService.delete(id);
            return guestFormatter.formatGuest(guest);
        },
        { beforeHandle: requirePermission(Permission.GUEST_EDIT) },
    )
