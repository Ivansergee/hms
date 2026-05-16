import { Elysia } from 'elysia';

import type { Permission } from "@/auth/permissions";
import { authService, SESSION_COOKIE } from "@/modules/auth/AuthService";

function requireAuth({ currentUser, set }: any) {
    if (!currentUser) {
        set.status = 401;
        return { message: 'Unauthorized' };
    }
}

export const authGuard = new Elysia({ name: 'auth-guard' })
    .derive({ as: 'scoped' }, async ({ cookie }) => {
        const sessionId = cookie[SESSION_COOKIE]?.value as string | undefined;
        const currentUser = await authService.getCurrentUser(sessionId);

        return { currentUser };
    })
    .onBeforeHandle(requireAuth);

export function requirePermission(permission: Permission) {
    return ({ currentUser, set }: any) => {
        if (!currentUser) {
            set.status = 401;
            return { message: 'Unauthorized' };
        }

        if (!currentUser.permissions.includes(permission)) {
            set.status = 403;
            return { message: 'Forbidden' };
        }
    };
}
