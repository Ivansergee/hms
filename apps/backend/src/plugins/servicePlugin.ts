import { Elysia } from 'elysia'
import { ServiceService } from "@/services/ServiceService";
import { serviceModel } from "@/models/serviceModel";

export const service = new Elysia({ prefix: '/service', tags: ['Service'] })
    .decorate('serviceService', new ServiceService())
    .get(
        '/',
        async ({ serviceService }) => {
            return serviceService.getAll();
        },
    )
    .get(
        '/group',
        async ({ serviceService }) => {
            return serviceService.getAllGroups();
        },
    )
    .post(
        '/',
        async ({ serviceService, body }) => {
            return serviceService.create(body);
        },
        { body: serviceModel.create },
    )
    .guard({ params: serviceModel.params })
    .put(
        '/:id',
        async ({ serviceService, params: { id }, body }) => {
            return serviceService.edit(id, body);
        },
        { body: serviceModel.create }
    )
    .delete(
        '/:id',
        async ({ serviceService, params: { id } }) => {
            return serviceService.delete(id);
        },
    )

