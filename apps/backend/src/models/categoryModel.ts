import { t } from 'elysia';

export const categoryModel = {
    create: t.Object({
        name: t.String(),
    }),
    update: t.Object({
        name: t.String(),
    }),
    params: t.Object({
        id: t.Numeric(),
    }),
};
