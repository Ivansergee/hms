import { Elysia, t } from "elysia";

import { RoomService } from "../services/RoomService";
import { roomModel } from "../models/roomModel";

export const room = new Elysia({ prefix: '/room', tags: ['Room'] })
    .decorate('roomService', new RoomService())
    .get(
        '/',
        async ({ roomService }) => {
            return roomService.getAll();
        },
    )
    .post(
        '/',
        async ({ roomService, body }) => {
            return roomService.create(body);
        },
        { body: roomModel.create },
    )
    .guard({
        params: t.Object({
            id: t.Numeric(),
        }),
    })
    .get(
        '/:id',
        async ({ roomService, params: { id }, error }) => {
            return roomService.getById(id);
        },
    )
    .put(
        '/:id',
        async ({ roomService, params: { id }, body, error }) => {
            return roomService.update(id, body);
        },
        { body: roomModel.update },
    )
    .delete(
        '/:id',
        async ({ roomService, params: { id }, error }) => {
            return roomService.delete(id);
        },
    )