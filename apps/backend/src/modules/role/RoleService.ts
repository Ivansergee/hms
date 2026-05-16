import type { Prisma } from "@prisma/client";
import { adminPermissions, permissionValues } from "@/auth/permissions";
import { prisma } from "../../../prisma/prisma";

type RoleData = {
    name?: string;
    permissionKeys?: string[];
};

const includeRoleRelations = {
    permissions: true,
} satisfies Prisma.RoleInclude;

export class RoleService {
    getPermissions() {
        return permissionValues;
    }

    getAll() {
        return prisma.role.findMany({
            include: includeRoleRelations,
            orderBy: { name: 'asc' },
        }).then(roles => roles.map(this.serializeRole));
    }

    getById(id: number) {
        return prisma.role.findUnique({
            where: { id },
            include: includeRoleRelations,
        }).then(role => role ? this.serializeRole(role) : null);
    }

    async create(data: Required<Pick<RoleData, 'name'>> & RoleData) {
        this.assertValidPermissions(data.permissionKeys ?? []);

        const role = await prisma.role.create({
            data: {
                name: data.name,
                permissions: {
                    create: data.permissionKeys?.map(permissionKey => ({ permissionKey })),
                },
            },
            include: includeRoleRelations,
        });

        return this.serializeRole(role);
    }

    async update(id: number, data: RoleData) {
        this.assertValidPermissions(data.permissionKeys ?? []);

        const role = await prisma.$transaction(async tx => {
            if (data.permissionKeys) {
                await tx.rolePermission.deleteMany({ where: { roleId: id } });
                await tx.rolePermission.createMany({
                    data: data.permissionKeys.map(permissionKey => ({ roleId: id, permissionKey })),
                    skipDuplicates: true,
                });
            }

            return tx.role.update({
                where: { id },
                data: {
                    name: data.name,
                },
                include: includeRoleRelations,
            });
        });

        return this.serializeRole(role);
    }

    async delete(id: number) {
        const role = await prisma.role.findUnique({ where: { id } });

        if (!role) {
            return null;
        }

        if (role.isSystem) {
            throw new Error('System roles cannot be deleted');
        }

        return prisma.role.delete({ where: { id } });
    }

    async ensureAdministratorRole() {
        return prisma.role.upsert({
            where: { name: 'Administrator' },
            create: {
                name: 'Administrator',
                isSystem: true,
                permissions: {
                    create: adminPermissions.map(permissionKey => ({ permissionKey })),
                },
            },
            update: {
                isSystem: true,
                permissions: {
                    deleteMany: {},
                    create: adminPermissions.map(permissionKey => ({ permissionKey })),
                },
            },
        });
    }

    private assertValidPermissions(permissionKeys: string[]) {
        const allowed = new Set<string>(permissionValues);
        const invalid = permissionKeys.filter(permissionKey => !allowed.has(permissionKey));

        if (invalid.length > 0) {
            throw new Error(`Unknown permissions: ${invalid.join(', ')}`);
        }
    }

    private serializeRole(role: Prisma.RoleGetPayload<{ include: typeof includeRoleRelations }>) {
        return {
            id: role.id,
            name: role.name,
            isSystem: role.isSystem,
            permissionKeys: role.permissions.map(permission => permission.permissionKey),
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
        };
    }
}
