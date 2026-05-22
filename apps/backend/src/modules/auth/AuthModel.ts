import { t } from 'elysia';

export const authModel = {
    login: t.Object({
        username: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
    }),
    changePassword: t.Object({
        currentPassword: t.String({ minLength: 1 }),
        newPassword: t.String({ minLength: 1 }),
    }),
    updateProfile: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.Optional(t.Union([t.String({ format: 'email' }), t.Null()])),
    }),
};
