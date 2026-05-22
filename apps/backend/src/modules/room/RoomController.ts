import { Elysia } from "elysia";

import { RoomService } from "@/modules/room/RoomService";
import { roomModel } from "@/modules/room/RoomModel";
import { Permission } from "@shared/enums/Permission";
import { requirePermission } from "@/modules/auth/AuthGuard";

export const roomController = new Elysia({ prefix: '/room', tags: ['Room'] })
    .decorate('roomService', new RoomService())
    .get(
        '/',
        async ({ roomService }) => {
            return roomService.getAll();
        },
        { beforeHandle: requirePermission(Permission.ROOM_READ) },
    )
    .post(
        '/',
        async ({ roomService, body }) => {
            return roomService.create(body);
        },
        { body: roomModel.create, beforeHandle: requirePermission(Permission.ROOM_EDIT) },
    )
    .get(
        '/availableIds',
        async ({ roomService, query: { start, end } }) => {
            return roomService.getAvailableIds(start, end);
        },
        { query: roomModel.available, beforeHandle: requirePermission(Permission.ROOM_READ) },
    )
    .guard({ params: roomModel.params })
    .get(
        '/:id',
        async ({ roomService, params: { id } }) => {
            return roomService.getById(id);
        },
        { beforeHandle: requirePermission(Permission.ROOM_READ) },
    )
    .put(
        '/:id',
        async ({ roomService, params: { id }, body }) => {
            return roomService.update(id, body);
        },
        { body: roomModel.update, beforeHandle: requirePermission(Permission.ROOM_EDIT) },
    )
    .delete(
        '/:id',
        async ({ roomService, params: { id } }) => {
            return roomService.delete(id);
        },
        { beforeHandle: requirePermission(Permission.ROOM_EDIT) },
    )
    .post(
        '/:id/setStatus',
        async ({ roomService, params: { id }, body }) => {
            return roomService.setStatus(id, body.status);
        },
        { body: roomModel.setStatus, beforeHandle: requirePermission(Permission.ROOM_EDIT) },
    )
