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
    .guard({ params: bookingModel.params })
    .get(
        '/:id',
        async ({ bookingService, params: { id }, error }) => {
            return bookingService.getById(id);
        },
    )
    .put(
        '/:id',
        async ({ bookingService, params: { id }, body, error }) => {
            return bookingService.update(id, body);
        },
        { body: bookingModel.update },
    )
    .delete(
        '/:id',
        async ({ bookingService, params: { id }, error }) => {
            return bookingService.delete(id);
        },
    )
