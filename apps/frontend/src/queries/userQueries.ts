import fetcher from '@/queries/fetcher';
import type { Role, User } from '@shared/types/user.ts';
import type { Permission } from '@shared/enums/Permission.ts';

export type UserListItem = User & {
  createdAt: string;
  updatedAt: string;
  roles: {
    id: number;
    name: string;
  }[];
};

export type UserCreateData = {
  username: string;
  email?: string;
  name: string;
  password: string;
  roleIds?: number[];
};

export type UserResetPasswordData = {
  password: string;
  mustChangePassword?: boolean;
};

export type RoleUpsertData = {
  name: string;
  permissionKeys?: Permission[];
};

export const userQueries = {
  getAll(): Promise<UserListItem[]> {
    return fetcher.get<UserListItem[]>('/user');
  },
  getRoles(): Promise<Role[]> {
    return fetcher.get<Role[]>('/role');
  },
  getRolePermissions(): Promise<Permission[]> {
    return fetcher.get<Permission[]>('/role/permissions');
  },
  create(data: UserCreateData): Promise<UserListItem> {
    return fetcher.post<UserListItem>('/user', data);
  },
  createRole(data: RoleUpsertData): Promise<Role> {
    return fetcher.post<Role>('/role', data);
  },
  updateRole(id: number, data: RoleUpsertData): Promise<Role> {
    return fetcher.put<Role>(`/role/${id}`, data);
  },
  deleteRole(id: number): Promise<void> {
    return fetcher.delete<void>(`/role/${id}`);
  },
  updateRoles(id: number, roleIds: number[]): Promise<UserListItem> {
    return fetcher.put<UserListItem>(`/user/${id}`, { roleIds });
  },
  resetPassword(id: number, data: UserResetPasswordData): Promise<{ success: boolean }> {
    return fetcher.post<{ success: boolean }, UserResetPasswordData>(`/user/${id}/reset-password`, data);
  },
  disable(id: number): Promise<UserListItem> {
    return fetcher.post<UserListItem>(`/user/${id}/disable`, {});
  },
  enable(id: number): Promise<UserListItem> {
    return fetcher.post<UserListItem>(`/user/${id}/enable`, {});
  },
};
