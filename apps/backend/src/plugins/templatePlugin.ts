import { Elysia } from 'elysia'
import { TemplateService } from "@/services/TemplateService";
import { templateModel } from "@/models/templateModel";
import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from 'fs/promises'

const uploadDir = path.join(process.cwd(), 'uploads')
await mkdir(uploadDir, { recursive: true })

export const template = new Elysia({ prefix: '/template', tags: ['Template'] })
    .decorate('templateService', new TemplateService())
    .post(
        '/upload',
        async ({ body }) => {
            const file = body.file;

            if (!file || !file.arrayBuffer) {
                throw Error('Invalid file');
            }

            const buffer = await file.arrayBuffer();
            const filePath = `uploads/${file.name}`;

            await Bun.write(filePath, buffer);

            return `http://192.168.3.2:3000/${filePath}`;
        },
        { body: templateModel.preview },
    )
    .post(
        '/preview',
        async ({ templateService, body, set }) => {
            const file = body.file;

            if (!file || !file.arrayBuffer) {
                throw Error('Invalid file');
            }

            const buffer = await file.arrayBuffer();
            const pdf = await templateService.getPreview(buffer);

            set.headers['Content-Type'] = 'application/pdf';
            return pdf;
        },
        { body: templateModel.preview },
    )
    // .get(
    //     '/',
    //     async ({ templateService }) => {
    //         return templateService.getAll();
    //     },
    // )
    // .post(
    //     '/',
    //     async ({ templateService, body }) => {
    //         return templateService.create(body);
    //     },
    //     { body: categoryModel.create },
    // )
    // .guard({ params: categoryModel.params })
    // .get(
    //     '/:id',
    //     async ({ templateService, params: { id } }) => {
    //         return templateService.getById(id);
    //     },
    // )
    // .put(
    //     '/:id',
    //     async ({ templateService, params: { id }, body }) => {
    //         return templateService.update(id, body);
    //     },
    //     { body: categoryModel.update },
    // )
    // .delete(
    //     '/:id',
    //     async ({ templateService, params: { id } }) => {
    //         return templateService.delete(id);
    //     },
    // )
