import { Elysia } from 'elysia'

import { guestModel } from "@/models/guestModel";
import { GuestService } from "@/services/GuestService";


export const guest = new Elysia({ prefix: '/guest', tags: ['Guest'] })
    .decorate('guestService', new GuestService())
    .get(
        '/',
        async ({ guestService }) => {
            return guestService.getAll();
        },
    )
    .post(
        '/',
        async ({ guestService, body }) => {
            return guestService.create(body);
        },
        { body: guestModel.create },
    )
    .guard({ params: guestModel.params })
    .get(
        '/:id',
        async ({ guestService, params: { id }, error }) => {
            return guestService.getById(id);
        },
    )
    .put(
        '/:id',
        async ({ guestService, params: { id }, body, error }) => {
            return guestService.update(id, body);
        },
        { body: guestModel.update },
    )
    .delete(
        '/:id',
        async ({ guestService, params: { id }, error }) => {
            return guestService.delete(id);
        },
    )
