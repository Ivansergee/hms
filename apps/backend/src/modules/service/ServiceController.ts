import { Elysia } from 'elysia'
import { ServiceService } from "@/modules/service/ServiceService";
import { serviceModel } from "@/modules/service/ServiceModel";
import { Permission } from "@shared/enums/Permission";
import { requirePermission } from "@/modules/auth/AuthGuard";

export const serviceController = new Elysia({ prefix: '/service', tags: ['Service'] })
    .decorate('serviceService', new ServiceService())
    .get(
        '/',
        async ({ serviceService }) => {
            return serviceService.getAll();
        },
        { beforeHandle: requirePermission(Permission.SERVICE_READ) },
    )
    .get(
        '/group',
        async ({ serviceService }) => {
            return serviceService.getAllGroups();
        },
        { beforeHandle: requirePermission(Permission.SERVICE_READ) },
    )
    .post(
        '/',
        async ({ serviceService, body }) => {
            return serviceService.create(body);
        },
        { body: serviceModel.create, beforeHandle: requirePermission(Permission.SERVICE_EDIT) },
    )
    .guard({ params: serviceModel.params })
    .put(
        '/:id',
        async ({ serviceService, params: { id }, body }) => {
            return serviceService.edit(id, body);
        },
        { body: serviceModel.create, beforeHandle: requirePermission(Permission.SERVICE_EDIT) }
    )
    .delete(
        '/:id',
        async ({ serviceService, params: { id } }) => {
            return serviceService.delete(id);
        },
        { beforeHandle: requirePermission(Permission.SERVICE_EDIT) },
    )
