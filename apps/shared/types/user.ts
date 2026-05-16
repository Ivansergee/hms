export interface User {
    id: number;
    username: string;
    email?: string;
    name: string;
    isActive: boolean;
    mustChangePassword: boolean;
    permissions: string[];
}

export interface Role {
    id: number;
    name: string;
    isSystem: boolean;
}