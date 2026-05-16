import { Elysia } from 'elysia'
import { ServiceService } from "@/modules/service/ServiceService";
import { serviceModel } from "@/modules/service/ServiceModel";
import { permissions } from "@/auth/permissions";
import { requirePermission } from "@/modules/auth/AuthGuard";

export const serviceController = new Elysia({ prefix: '/service', tags: ['Service'] })
    .decorate('serviceService', new ServiceService())
    .get(
        '/',
        async ({ serviceService }) => {
            return serviceService.getAll();
        },
        { beforeHandle: requirePermission(permissions.SERVICE_READ) },
    )
    .get(
        '/group',
        async ({ serviceService }) => {
            return serviceService.getAllGroups();
        },
        { beforeHandle: requirePermission(permissions.SERVICE_READ) },
    )
    .post(
        '/',
        async ({ serviceService, body }) => {
            return serviceService.create(body);
        },
        { body: serviceModel.create, beforeHandle: requirePermission(permissions.SERVICE_MANAGE) },
    )
    .guard({ params: serviceModel.params })
    .put(
        '/:id',
        async ({ serviceService, params: { id }, body }) => {
            return serviceService.edit(id, body);
        },
        { body: serviceModel.create, beforeHandle: requirePermission(permissions.SERVICE_MANAGE) }
    )
    .delete(
        '/:id',
        async ({ serviceService, params: { id } }) => {
            return serviceService.delete(id);
        },
        { beforeHandle: requirePermission(permissions.SERVICE_MANAGE) },
    )
