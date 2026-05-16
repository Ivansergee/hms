import type { Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/prisma";

type CreateUserData = {
    username: string;
    email?: string;
    name: string;
    password: string;
    roleIds?: number[];
};

type UpdateUserData = {
    username?: string;
    email?: string;
    name?: string;
    roleIds?: number[];
};

const includeUserRelations = {
    roles: {
        include: {
            role: {
                include: {
                    permissions: true,
                },
            },
        },
    },
} satisfies Prisma.UserInclude;

export class UserService {
    getAll() {
        return prisma.user.findMany({
            include: includeUserRelations,
            orderBy: { username: 'asc' },
        }).then(users => users.map(this.serializeUser));
    }

    getById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            include: includeUserRelations,
        }).then(user => user ? this.serializeUser(user) : null);
    }

    async create(data: CreateUserData) {
        const user = await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                name: data.name,
                passwordHash: await Bun.password.hash(data.password, { algorithm: 'bcrypt' }),
                roles: {
                    create: data.roleIds?.map(roleId => ({
                        role: { connect: { id: roleId } },
                    })),
                },
            },
            include: includeUserRelations,
        });

        return this.serializeUser(user);
    }

    async update(id: number, data: UpdateUserData) {
        const { roleIds, ...userData } = data;

        const user = await prisma.$transaction(async tx => {
            if (roleIds) {
                await tx.userRole.deleteMany({ where: { userId: id } });
                await tx.userRole.createMany({
                    data: roleIds.map(roleId => ({ userId: id, roleId })),
                    skipDuplicates: true,
                });
            }

            return tx.user.update({
                where: { id },
                data: userData,
                include: includeUserRelations,
            });
        });

        return this.serializeUser(user);
    }

    async resetPassword(id: number, password: string, mustChangePassword = true) {
        await prisma.user.update({
            where: { id },
            data: {
                passwordHash: await Bun.password.hash(password, { algorithm: 'bcrypt' }),
                mustChangePassword,
            },
        });

        await prisma.session.deleteMany({ where: { userId: id } });

        return { success: true };
    }

    setActive(id: number, isActive: boolean) {
        return prisma.user.update({
            where: { id },
            data: { isActive },
            include: includeUserRelations,
        }).then(user => this.serializeUser(user));
    }

    private serializeUser(user: Prisma.UserGetPayload<{ include: typeof includeUserRelations }>) {
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
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            roles: user.roles.map(({ role }) => ({
                id: role.id,
                name: role.name,
            })),
            permissions: [...permissions],
        };
    }
}
