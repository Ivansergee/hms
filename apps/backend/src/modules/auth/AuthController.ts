import { Elysia } from 'elysia';

import { authModel } from "@/modules/auth/AuthModel";
import { authService, SESSION_COOKIE } from "@/modules/auth/AuthService";

function getSessionCookieOptions(expires?: Date) {
    return {
        httpOnly: true,
        sameSite: 'strict' as const,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        expires,
    };
}

export const authController = new Elysia({ prefix: '/auth', tags: ['Auth'] })
    .post(
        '/login',
        async ({ body, cookie, set }) => {
            const result = await authService.login(body.username, body.password);

            if (!result) {
                set.status = 401;
                return { message: 'Invalid username or password' };
            }

            cookie[SESSION_COOKIE].set({
                value: result.session.id,
                ...getSessionCookieOptions(result.session.expiresAt),
            });

            return result.user;
        },
        { body: authModel.login },
    )
    .get('/me', async ({ cookie, set }) => {
        const sessionId = cookie[SESSION_COOKIE]?.value as string | undefined;
        const currentUser = await authService.getCurrentUser(sessionId);

        if (!currentUser) {
            set.status = 401;
            return { message: 'Unauthorized' };
        }

        return currentUser;
    })
    .post('/logout', async ({ cookie }) => {
        const sessionId = cookie[SESSION_COOKIE]?.value as string | undefined;

        await authService.logout(sessionId);
        cookie[SESSION_COOKIE].remove();

        return { success: true };
    })
    .post(
        '/change-password',
        async ({ cookie, body, set }) => {
            const sessionId = cookie[SESSION_COOKIE]?.value as string | undefined;
            const currentUser = await authService.getCurrentUser(sessionId);

            if (!currentUser) {
                set.status = 401;
                return { message: 'Unauthorized' };
            }

            const changed = await authService.changePassword(
                currentUser.id,
                body.currentPassword,
                body.newPassword,
            );

            if (!changed) {
                set.status = 400;
                return { success: false };
            }

            return { success: true };
        },
        { body: authModel.changePassword },
    );
