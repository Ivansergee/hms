import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Role } from '@shared/types/user.ts';
import type { Permission } from '@shared/enums/Permission.ts';
import {
  userQueries, type RoleUpsertData, type UserCreateData, type UserListItem, type UserResetPasswordData,
} from '@/queries/userQueries.ts';

export const useUserStore = defineStore('users', () => {
  const users = ref<UserListItem[]>([]);
  const roles = ref<Role[]>([]);
  const rolePermissions = ref<Permission[]>([]);

  const fetch = async (): Promise<void> => {
    users.value = await userQueries.getAll();
    roles.value = await userQueries.getRoles();
    rolePermissions.value = await userQueries.getRolePermissions();
  };

  const create = async (data: UserCreateData): Promise<void> => {
    const createdUser = await userQueries.create(data);
    users.value = [...users.value, createdUser].sort((a, b) => a.username.localeCompare(b.username));
  };

  const updateRoles = async (id: number, roleIds: number[]): Promise<void> => {
    const updatedUser = await userQueries.updateRoles(id, roleIds);
    const index = users.value.findIndex((user) => user.id === id);

    if (index !== -1) {
      users.value[index] = updatedUser;
    }
  };

  const resetPassword = async (id: number, data: UserResetPasswordData): Promise<void> => {
    await userQueries.resetPassword(id, data);
    const index = users.value.findIndex((user) => user.id === id);

    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        mustChangePassword: data.mustChangePassword ?? true,
      };
    }
  };

  const createRole = async (data: RoleUpsertData): Promise<void> => {
    const createdRole = await userQueries.createRole(data);
    roles.value = [...roles.value, createdRole].sort((a, b) => a.name.localeCompare(b.name));
  };

  const updateRole = async (id: number, data: RoleUpsertData): Promise<void> => {
    const updatedRole = await userQueries.updateRole(id, data);
    const index = roles.value.findIndex((role) => role.id === id);

    if (index !== -1) {
      roles.value[index] = updatedRole;
      roles.value = [...roles.value].sort((a, b) => a.name.localeCompare(b.name));
      users.value = users.value.map((user) => ({
        ...user,
        roles: user.roles.map((role) => (role.id === updatedRole.id ? {
          id: updatedRole.id,
          name: updatedRole.name,
        } : role)),
      }));
    }
  };

  const deleteRole = async (id: number): Promise<void> => {
    await userQueries.deleteRole(id);
    roles.value = roles.value.filter((role) => role.id !== id);
    users.value = users.value.map((user) => ({
      ...user,
      roles: user.roles.filter((role) => role.id !== id),
    }));
  };

  const disable = async (id: number): Promise<void> => {
    const updatedUser = await userQueries.disable(id);
    const index = users.value.findIndex((user) => user.id === id);

    if (index !== -1) {
      users.value[index] = updatedUser;
    }
  };

  const enable = async (id: number): Promise<void> => {
    const updatedUser = await userQueries.enable(id);
    const index = users.value.findIndex((user) => user.id === id);

    if (index !== -1) {
      users.value[index] = updatedUser;
    }
  };

  return {
    users,
    roles,
    rolePermissions,
    fetch,
    create,
    updateRoles,
    resetPassword,
    createRole,
    updateRole,
    deleteRole,
    disable,
    enable,
  };
});
