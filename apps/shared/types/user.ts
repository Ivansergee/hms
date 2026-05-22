import type { Permission } from '../enums/Permission';

export interface User {
    id: number;
    username: string;
    email?: string | null;
    name: string;
    isActive: boolean;
    mustChangePassword: boolean;
    roles: Pick<Role, 'id' | 'name'>[];
    permissions: Permission[];
}

export interface Role {
    id: number;
    name: string;
    isSystem: boolean;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
}
