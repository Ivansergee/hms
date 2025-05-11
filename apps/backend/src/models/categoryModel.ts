import { t } from 'elysia';

const create = t.Object({
    name: t.String(),
    tag: t.String(),
    capacity: t.Number(),
});

export const categoryModel = {
    create,
    update: t.Partial(create),
    params: t.Object({
        id: t.Numeric(),
    }),
};
