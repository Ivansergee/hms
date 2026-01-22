import { Static, t } from 'elysia';
import { enumToTypebox } from "@/utils/enumUtils";
import { BookingStatus } from "@shared/enums/BookingStatus";
import { guestModel } from "@/models/guestModel";

const create = t.Object({
    checkInDate: t.String({ format: 'date' }),
    checkOutDate: t.String({ format: 'date' }),
    arrivalMinutes: t.Optional(t.Integer()),
    departureMinutes: t.Optional(t.Integer()),
    status: t.Optional(t.Enum(enumToTypebox(BookingStatus))),
    roomId: t.Integer(),
    guests: t.Array(guestModel.create),
})

const update = t.Object({
    checkInDate: t.String({ format: 'date' }),
    checkOutDate: t.String({ format: 'date' }),
    arrivalMinutes: t.Optional(t.Integer()),
    departureMinutes: t.Optional(t.Integer()),
    roomId: t.Integer(),
    guestIds: t.Array(t.Integer()),
    mainGuestId: t.Integer(),
    status: t.Enum(enumToTypebox(BookingStatus)),
});

const filter = t.Object({
    checkInDate: t.String({ format: 'date' }),
    checkOutDate: t.String({ format: 'date' }),
    roomId: t.Optional(t.Integer()),
    guestId: t.Optional(t.Integer()),
    status: t.Optional(t.Enum(enumToTypebox(BookingStatus))),
});

const editPlacement = t.Object({
    checkInDate: t.String({ format: 'date' }),
    checkOutDate: t.String({ format: 'date' }),
    arrivalMinutes: t.Optional(t.Integer()),
    departureMinutes: t.Optional(t.Integer()),
    roomId: t.Integer(),
})

export const bookingModel = {
    create,
    update,
    filter,
    editPlacement,
    params: t.Object({
        id: t.Numeric(),
    }),
};

export type BookingCreateDTO = Static<typeof bookingModel.create>
export type BookingUpdateDTO = Static<typeof bookingModel.update>
export type BookingFilterDTO = Static<typeof bookingModel.filter>
