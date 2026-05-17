import fetcher from '@/queries/fetcher';
import type { Role, User } from '@shared/types/user.ts';

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

export const userQueries = {
  getAll(): Promise<UserListItem[]> {
    return fetcher.get<UserListItem[]>('/user');
  },
  getRoles(): Promise<Role[]> {
    return fetcher.get<Role[]>('/role');
  },
  create(data: UserCreateData): Promise<UserListItem> {
    return fetcher.post<UserListItem>('/user', data);
  },
  updateRoles(id: number, roleIds: number[]): Promise<UserListItem> {
    return fetcher.put<UserListItem>(`/user/${id}`, { roleIds });
  },
  disable(id: number): Promise<UserListItem> {
    return fetcher.post<UserListItem>(`/user/${id}/disable`, {});
  },
  enable(id: number): Promise<UserListItem> {
    return fetcher.post<UserListItem>(`/user/${id}/enable`, {});
  },
};
