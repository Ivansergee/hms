import { Elysia } from 'elysia'

import { CategoryService } from "@/modules/category/CategoryService";
import { categoryModel } from "@/modules/category/CategoryModel";
import { permissions } from "@/auth/permissions";
import { requirePermission } from "@/modules/auth/AuthGuard";

export const categoryController = new Elysia({ prefix: '/category', tags: ['RoomCategory'] })
    .decorate('categoryService', new CategoryService())
    .get(
        '/',
        async ({ categoryService }) => {
            return categoryService.getAll();
        },
        { beforeHandle: requirePermission(permissions.CATEGORY_READ) },
    )
    .post(
        '/',
        async ({ categoryService, body }) => {
            return categoryService.create(body);
        },
        { body: categoryModel.create, beforeHandle: requirePermission(permissions.CATEGORY_MANAGE) },
    )
    .guard({ params: categoryModel.params })
    .get(
        '/:id',
        async ({ categoryService, params: { id } }) => {
            return categoryService.getById(id);
        },
        { beforeHandle: requirePermission(permissions.CATEGORY_READ) },
    )
    .put(
        '/:id',
        async ({ categoryService, params: { id }, body }) => {
            return categoryService.update(id, body);
        },
        { body: categoryModel.update, beforeHandle: requirePermission(permissions.CATEGORY_MANAGE) },
    )
    .delete(
        '/:id',
        async ({ categoryService, params: { id } }) => {
            return categoryService.delete(id);
        },
        { beforeHandle: requirePermission(permissions.CATEGORY_MANAGE) },
    )
