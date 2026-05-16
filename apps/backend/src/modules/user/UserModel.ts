import { t } from 'elysia';

const create = t.Object({
    username: t.String({ minLength: 1 }),
    email: t.Optional(t.String({ format: 'email' })),
    name: t.String({ minLength: 1 }),
    password: t.String({ minLength: 8 }),
    roleIds: t.Optional(t.Array(t.Number())),
});

export const userModel = {
    create,
    update: t.Partial(t.Omit(create, ['password'])),
    resetPassword: t.Object({
        password: t.String({ minLength: 8 }),
        mustChangePassword: t.Optional(t.Boolean()),
    }),
    params: t.Object({
        id: t.Numeric(),
    }),
};
