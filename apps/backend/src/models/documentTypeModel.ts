import { t } from 'elysia'

const create = t.Object({
    name: t.String(),
});

export const documentTypeModel = {
    create,
    update: t.Partial(create),
    params: t.Object({
        id: t.Numeric(),
    }),
};
