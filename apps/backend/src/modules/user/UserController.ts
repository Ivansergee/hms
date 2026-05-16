import { Elysia } from 'elysia';

import { permissions } from "@/auth/permissions";
import { requirePermission } from "@/modules/auth/AuthGuard";
import { userModel } from "@/modules/user/UserModel";
import { UserService } from "@/modules/user/UserService";

export const userController = new Elysia({ prefix: '/user', tags: ['User'] })
    .decorate('userService', new UserService())
    .guard({ beforeHandle: requirePermission(permissions.USER_MANAGE) })
    .get('/', ({ userService }) => userService.getAll())
    .post(
        '/',
        ({ userService, body }) => userService.create(body),
        { body: userModel.create },
    )
    .guard({ params: userModel.params })
    .get('/:id', ({ userService, params: { id } }) => userService.getById(id))
    .put(
        '/:id',
        ({ userService, params: { id }, body }) => userService.update(id, body),
        { body: userModel.update },
    )
    .post(
        '/:id/reset-password',
        ({ userService, params: { id }, body }) =>
            userService.resetPassword(id, body.password, body.mustChangePassword),
        { body: userModel.resetPassword },
    )
    .post('/:id/disable', ({ userService, params: { id } }) => userService.setActive(id, false))
    .post('/:id/enable', ({ userService, params: { id } }) => userService.setActive(id, true));
