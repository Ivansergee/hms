import { Static, t } from 'elysia';
import { enumToTypebox } from "@/utils/enumUtils";
import { BookingStatus } from "@shared/enums/BookingStatus";
import { guestModel } from "@/modules/guest/GuestModel";

const guestInput = t.Object({
    ...guestModel.create.properties,
    guestId: t.Optional(t.Integer()),
}, { additionalProperties: false });

const create = t.Object({
    checkInDate: t.String({ format: 'date' }),
    checkOutDate: t.String({ format: 'date' }),
    arrivalMinutes: t.Integer(),
    departureMinutes: t.Integer(),
    status: t.Optional(t.Enum(enumToTypebox(BookingStatus))),
    roomId: t.Integer(),
    guests: t.Array(guestInput),
    mainGuestIndex: t.Integer(),
})

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

const createBookingGuestSnapshot = guestModel.create;
const updateBookingGuestSnapshot = t.Object({
    firstName: t.Optional(guestModel.create.properties.firstName),
    lastName: t.Optional(guestModel.create.properties.lastName),
    parentName: t.Optional(t.Union([guestModel.create.properties.parentName, t.Null()])),
    gender: t.Optional(t.Union([guestModel.create.properties.gender, t.Null()])),
    birthdate: t.Optional(t.Union([guestModel.create.properties.birthdate, t.Null()])),
    phone: t.Optional(t.Union([guestModel.create.properties.phone, t.Null()])),
    email: t.Optional(t.Union([guestModel.create.properties.email, t.Null()])),
    citizenship: t.Optional(t.Union([guestModel.create.properties.citizenship, t.Null()])),
}, { additionalProperties: false });

export const bookingModel = {
    create,
    filter,
    editPlacement,
    createBookingGuestSnapshot,
    linkBookingGuest: t.Object({
        guestId: t.Integer(),
    }),
    updateBookingGuestSnapshot,
    setStatus: t.Object({
        status: t.Enum(enumToTypebox(BookingStatus)),
    }),
    params: t.Object({
        id: t.Numeric(),
    }),
    bookingGuestParams: t.Object({
        id: t.Numeric(),
        bookingGuestId: t.Numeric(),
    }),
};

export type BookingFilterDTO = Static<typeof bookingModel.filter>;
