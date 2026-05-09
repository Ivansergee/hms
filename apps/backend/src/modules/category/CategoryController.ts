import { Elysia } from 'elysia'

import { CategoryService } from "@/modules/category/CategoryService";
import { categoryModel } from "@/modules/category/CategoryModel";

export const categoryController = new Elysia({ prefix: '/category', tags: ['RoomCategory'] })
    .decorate('categoryService', new CategoryService())
    .get(
        '/',
        async ({ categoryService }) => {
            return categoryService.getAll();
        },
    )
    .post(
        '/',
        async ({ categoryService, body }) => {
            return categoryService.create(body);
        },
        { body: categoryModel.create },
    )
    .guard({ params: categoryModel.params })
    .get(
        '/:id',
        async ({ categoryService, params: { id } }) => {
            return categoryService.getById(id);
        },
    )
    .put(
        '/:id',
        async ({ categoryService, params: { id }, body }) => {
            return categoryService.update(id, body);
        },
        { body: categoryModel.update },
    )
    .delete(
        '/:id',
        async ({ categoryService, params: { id } }) => {
            return categoryService.delete(id);
        },
    )
