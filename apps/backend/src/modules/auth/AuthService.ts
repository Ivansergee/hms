import { prisma } from "../../../prisma/prisma";

export const SESSION_COOKIE = 'hms_session';

const SESSION_TTL_DAYS = 7;

const userSelect = {
    id: true,
    username: true,
    email: true,
    name: true,
    isActive: true,
    mustChangePassword: true,
    roles: {
        include: {
            role: {
                include: {
                    permissions: true,
                },
            },
        },
    },
} as const;

type UserWithRoles = NonNullable<Awaited<ReturnType<AuthService['getUserById']>>>;

export class AuthService {
    async login(username: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user || !user.isActive) {
            return null;
        }

        const isValid = await Bun.password.verify(password, user.passwordHash);

        if (!isValid) {
            return null;
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

        const session = await prisma.session.create({
            data: {
                id: crypto.randomUUID(),
                userId: user.id,
                expiresAt,
            },
        });

        return {
            session,
            user: this.serializeUser(user),
        };
    }

    async getCurrentUser(sessionId?: string) {
        if (!sessionId) {
            return null;
        }

        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                user: {
                    include: {
                        roles: {
                            include: {
                                role: {
                                    include: {
                                        permissions: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
            return null;
        }

        return this.serializeUser(session.user);
    }

    async logout(sessionId?: string) {
        if (!sessionId) {
            return;
        }

        await prisma.session.deleteMany({ where: { id: sessionId } });
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.isActive) {
            return false;
        }

        const isValid = await Bun.password.verify(currentPassword, user.passwordHash);

        if (!isValid) {
            return false;
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: await Bun.password.hash(newPassword, { algorithm: 'bcrypt' }),
                mustChangePassword: false,
            },
        });

        return true;
    }

    getUserById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: userSelect,
        });
    }

    private serializeUser(user: UserWithRoles) {
        const permissions = new Set<string>();

        for (const userRole of user.roles) {
            for (const permission of userRole.role.permissions) {
                permissions.add(permission.permissionKey);
            }
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            isActive: user.isActive,
            mustChangePassword: user.mustChangePassword,
            roles: user.roles.map(({ role }) => ({
                id: role.id,
                name: role.name,
            })),
            permissions: [...permissions],
        };
    }
}

export const authService = new AuthService();
