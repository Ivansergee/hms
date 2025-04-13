import { Static, t } from 'elysia';
import { enumToTypebox } from "../utils/enumUtils";
import { BookingStatus } from "../../../shared/generated/enums";

const create = t.Object({
    start: t.String({ format: 'date-time' }),
    end: t.String({ format: 'date-time' }),
    status: t.Optional(t.Enum(enumToTypebox(BookingStatus))),
    roomId: t.Optional(t.Numeric()),
    guestId: t.Numeric(),
});

export const bookingModel = {
    create,
    update: t.Partial(create),
    params: t.Object({
        id: t.Numeric(),
    }),
};

export type BookingCreateDTO = Static<typeof bookingModel.create>
export type BookingUpdateDTO = Static<typeof bookingModel.update>
