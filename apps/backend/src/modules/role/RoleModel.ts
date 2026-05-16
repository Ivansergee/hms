import { t } from 'elysia';

const create = t.Object({
    name: t.String({ minLength: 1 }),
    permissionKeys: t.Optional(t.Array(t.String())),
});

export const roleModel = {
    create,
    update: t.Partial(create),
    params: t.Object({
        id: t.Numeric(),
    }),
};
