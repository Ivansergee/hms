import { Elysia } from 'elysia';

import { permissions } from "@/auth/permissions";
import { requirePermission } from "@/modules/auth/AuthGuard";
import { roleModel } from "@/modules/role/RoleModel";
import { RoleService } from "@/modules/role/RoleService";

export const roleController = new Elysia({ prefix: '/role', tags: ['Role'] })
    .decorate('roleService', new RoleService())
    .get(
        '/permissions',
        ({ roleService }) => roleService.getPermissions(),
        { beforeHandle: requirePermission(permissions.ROLE_READ) },
    )
    .get(
        '/',
        ({ roleService }) => roleService.getAll(),
        { beforeHandle: requirePermission(permissions.ROLE_READ) },
    )
    .post(
        '/',
        ({ roleService, body }) => roleService.create(body),
        { body: roleModel.create, beforeHandle: requirePermission(permissions.ROLE_MANAGE) },
    )
    .guard({ params: roleModel.params })
    .get(
        '/:id',
        ({ roleService, params: { id } }) => roleService.getById(id),
        { beforeHandle: requirePermission(permissions.ROLE_READ) },
    )
    .put(
        '/:id',
        ({ roleService, params: { id }, body }) => roleService.update(id, body),
        { body: roleModel.update, beforeHandle: requirePermission(permissions.ROLE_MANAGE) },
    )
    .delete(
        '/:id',
        ({ roleService, params: { id }, set }) => roleService.delete(id).catch(error => {
            set.status = 400;
            return { message: error.message };
        }),
        { beforeHandle: requirePermission(permissions.ROLE_MANAGE) },
    );
