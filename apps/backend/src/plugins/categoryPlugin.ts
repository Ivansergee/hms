import { Elysia } from 'elysia'

import { CategoryService } from "@/services/CategoryService";
import { categoryModel } from "@/models/categoryModel";

export const category = new Elysia({ prefix: '/category', tags: ['RoomCategory'] })
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
        async ({ categoryService, params: { id }, error }) => {
            return categoryService.getById(id);
        },
    )
    .put(
        '/:id',
        async ({ categoryService, params: { id }, body, error }) => {
            return categoryService.update(id, body);
        },
        { body: categoryModel.update },
    )
    .delete(
        '/:id',
        async ({ categoryService, params: { id }, error }) => {
            return categoryService.delete(id);
        },
    )
