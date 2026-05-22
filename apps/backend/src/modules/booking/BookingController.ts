import { Elysia } from 'elysia'
import { BookingService } from "@/modules/booking/BookingService";
import { bookingModel } from "@/modules/booking/BookingModel";
import { Permission } from "@shared/enums/Permission";
import { requirePermission } from "@/modules/auth/AuthGuard";

export const bookingController = new Elysia({ prefix: '/booking', tags: ['Booking'] })
    .decorate('bookingService', new BookingService())
    .get(
        '/',
        async ({ bookingService }) => {
            return bookingService.getAll();
        },
        { beforeHandle: requirePermission(Permission.BOOKING_READ) },
    )
    .post(
        '/',
        async ({ bookingService, body }) => {
            return bookingService.create(body);
        },
        { body: bookingModel.create, beforeHandle: requirePermission(Permission.BOOKING_EDIT) },
    )
    .post(
        '/filter',
        async ({ bookingService, body }) => {
            return bookingService.filter(body);
        },
        { body: bookingModel.filter, beforeHandle: requirePermission(Permission.BOOKING_READ) }
    )
    .guard({ params: bookingModel.params })
    .get(
        '/:id',
        async ({ bookingService, params: { id } }) => {
            return bookingService.getById(id);
        },
        { beforeHandle: requirePermission(Permission.BOOKING_READ) },
    )
    // .put(
    //     '/:id',
    //     async ({ bookingService, params: { id }, body }) => {
    //         return bookingService.update(id, body);
    //     },
    //     { body: bookingModel.update },
    // )
    .post(
        '/:id/placement',
        async ({ bookingService, params: { id }, body }) => {
            return bookingService.editPlacement(id, body);
        },
        { body: bookingModel.editPlacement, beforeHandle: requirePermission(Permission.BOOKING_EDIT) }
    )
    .post(
        '/:id/setStatus',
        async ({ bookingService, params: { id }, body }) => {
            return bookingService.setStatus(id, body.status);
        },
        { body: bookingModel.setStatus, beforeHandle: requirePermission(Permission.BOOKING_EDIT) }
    )
    .delete(
        '/:id',
        async ({ bookingService, params: { id } }) => {
            return bookingService.delete(id);
        },
        { beforeHandle: requirePermission(Permission.BOOKING_EDIT) },
    )
    .get(
        '/:id/details',
        async ({ bookingService, params: { id } }) => {
            return bookingService.getDetails(id);
        },
        { beforeHandle: requirePermission(Permission.BOOKING_READ) },
    )
