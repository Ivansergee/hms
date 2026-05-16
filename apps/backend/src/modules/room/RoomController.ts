import { Elysia } from "elysia";

import { RoomService } from "@/modules/room/RoomService";
import { roomModel } from "@/modules/room/RoomModel";
import { permissions } from "@/auth/permissions";
import { requirePermission } from "@/modules/auth/AuthGuard";

export const roomController = new Elysia({ prefix: '/room', tags: ['Room'] })
    .decorate('roomService', new RoomService())
    .get(
        '/',
        async ({ roomService }) => {
            return roomService.getAll();
        },
        { beforeHandle: requirePermission(permissions.ROOM_READ) },
    )
    .post(
        '/',
        async ({ roomService, body }) => {
            return roomService.create(body);
        },
        { body: roomModel.create, beforeHandle: requirePermission(permissions.ROOM_UPDATE) },
    )
    .get(
        '/availableIds',
        async ({ roomService, query: { start, end } }) => {
            return roomService.getAvailableIds(start, end);
        },
        { query: roomModel.available, beforeHandle: requirePermission(permissions.ROOM_READ) },
    )
    .guard({ params: roomModel.params })
    .get(
        '/:id',
        async ({ roomService, params: { id } }) => {
            return roomService.getById(id);
        },
        { beforeHandle: requirePermission(permissions.ROOM_READ) },
    )
    .put(
        '/:id',
        async ({ roomService, params: { id }, body }) => {
            return roomService.update(id, body);
        },
        { body: roomModel.update, beforeHandle: requirePermission(permissions.ROOM_UPDATE) },
    )
    .delete(
        '/:id',
        async ({ roomService, params: { id } }) => {
            return roomService.delete(id);
        },
        { beforeHandle: requirePermission(permissions.ROOM_UPDATE) },
    )
    .post(
        '/:id/setStatus',
        async ({ roomService, params: { id }, body }) => {
            return roomService.setStatus(id, body.status);
        },
        { body: roomModel.setStatus, beforeHandle: requirePermission(permissions.ROOM_STATUS_UPDATE) },
    )
