import { Elysia } from "elysia";

import { RoomService } from "@/services/RoomService";
import { roomModel } from "@/models/roomModel";

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
    .get(
        '/availableIds',
        async ({ roomService, query: { start, end } }) => {
            return roomService.getAvailableIds(start, end);
        },
        { query: roomModel.available},
    )
    .guard({ params: roomModel.params })
    .get(
        '/:id',
        async ({ roomService, params: { id } }) => {
            return roomService.getById(id);
        },
    )
    .put(
        '/:id',
        async ({ roomService, params: { id }, body }) => {
            return roomService.update(id, body);
        },
        { body: roomModel.update },
    )
    .delete(
        '/:id',
        async ({ roomService, params: { id } }) => {
            return roomService.delete(id);
        },
    )