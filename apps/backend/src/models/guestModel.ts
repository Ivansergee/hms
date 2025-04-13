import { t } from 'elysia'

const create = t.Object({
    firstName: t.String(),
    lastName: t.String(),
    parentName: t.Optional(t.String()),
    birthdate: t.String({ format: 'date-time' }),
    phone: t.Optional(t.String()),
    email: t.Optional(t.String({ format: 'email' })),
    citizenship: t.Optional(t.String())
});

export const guestModel = {
    create,
    update: t.Partial(create),
    params: t.Object({
        id: t.Numeric(),
    }),
};
