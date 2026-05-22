import { Elysia } from 'elysia';

import { Permission } from "@shared/enums/Permission";
import { requirePermission } from "@/modules/auth/AuthGuard";
import { userModel } from "@/modules/user/UserModel";
import { UserService } from "@/modules/user/UserService";

export const userController = new Elysia({ prefix: '/user', tags: ['User'] })
    .decorate('userService', new UserService())
    .get(
        '/',
        ({ userService }) => userService.getAll(),
        { beforeHandle: requirePermission(Permission.USER_READ) },
    )
    .post(
        '/',
        ({ userService, body }) => userService.create(body),
        { body: userModel.create, beforeHandle: requirePermission(Permission.USER_EDIT) },
    )
    .guard({ params: userModel.params })
    .get(
        '/:id',
        ({ userService, params: { id } }) => userService.getById(id),
        { beforeHandle: requirePermission(Permission.USER_READ) },
    )
    .put(
        '/:id',
        ({ userService, params: { id }, body }) => userService.update(id, body),
        { body: userModel.update, beforeHandle: requirePermission(Permission.USER_EDIT) },
    )
    .post(
        '/:id/reset-password',
        ({ userService, params: { id }, body }) =>
            userService.resetPassword(id, body.password, body.mustChangePassword),
        { body: userModel.resetPassword, beforeHandle: requirePermission(Permission.USER_EDIT) },
    )
    .post(
        '/:id/disable',
        ({ userService, params: { id } }) => userService.setActive(id, false),
        { beforeHandle: requirePermission(Permission.USER_EDIT) },
    )
    .post(
        '/:id/enable',
        ({ userService, params: { id } }) => userService.setActive(id, true),
        { beforeHandle: requirePermission(Permission.USER_EDIT) },
    );
