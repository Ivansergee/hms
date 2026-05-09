import { t } from 'elysia';

const preview = t.Object({
    file: t.File(),
});

export const templateModel = {
    preview,
    params: t.Object({
        id: t.Numeric(),
    }),
};
