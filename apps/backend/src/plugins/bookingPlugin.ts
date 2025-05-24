import { Elysia } from 'elysia'
import { BookingService } from "@/services/BookingService";
import { bookingModel } from "@/models/bookingModel";

export const booking = new Elysia({ prefix: '/booking', tags: ['Booking'] })
    .decorate('bookingService', new BookingService())
    .get(
        '/',
        async ({ bookingService }) => {
            return bookingService.getAll();
        },
    )
    .post(
        '/',
        async ({ bookingService, body }) => {
            return bookingService.create(body);
        },
        { body: bookingModel.create },
    )
    .post(
        '/filter',
        async ({ bookingService, body }) => {
            return bookingService.filter(body);
        },
        { body: bookingModel.filter }
    )
    .guard({ params: bookingModel.params })
    .get(
        '/:id',
        async ({ bookingService, params: { id } }) => {
            return bookingService.getById(id);
        },
    )
    // .put(
    //     '/:id',
    //     async ({ bookingService, params: { id }, body }) => {
    //         return bookingService.update(id, body);
    //     },
    //     { body: bookingModel.update },
    // )
    .patch(
        '/:id/placement',
        async ({ bookingService, params: { id }, body }) => {
            return bookingService.editPlacement(id, body);
        },
        { body: bookingModel.editPlacement}
    )
    .delete(
        '/:id',
        async ({ bookingService, params: { id } }) => {
            return bookingService.delete(id);
        },
    )
    .get(
        '/details/:id',
        async ({ bookingService, params: { id } }) => {
            return bookingService.getDetails(id);
        },
    )
