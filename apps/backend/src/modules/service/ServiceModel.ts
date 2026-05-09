import { t } from "elysia";

const create = t.Object({
    name: t.String(),
    price: t.String({ pattern: '^\\d+(\\.\\d{1,2})?$' }),
    isActive: t.Boolean(),
});

export const serviceModel = {
    create,
    params: t.Object({
        id: t.Numeric(),
    }),
};
