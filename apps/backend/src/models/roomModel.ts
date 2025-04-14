import { t } from 'elysia';
import { enumToTypebox } from "@/utils/enumUtils";
import { RoomStatus } from "@shared/generated/enums";

const create = t.Object({
    name: t.String(),
    status: t.Optional(t.Enum(enumToTypebox(RoomStatus))),
    categoryId: t.Number(),
});

export const roomModel = {
    create,
    update: t.Partial(create),
};
