import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Role } from '@shared/types/user.ts';
import { userQueries, type UserCreateData, type UserListItem } from '@/queries/userQueries.ts';

export const useUserStore = defineStore('users', () => {
  const users = ref<UserListItem[]>([]);
  const roles = ref<Role[]>([]);

  const fetch = async (): Promise<void> => {
    users.value = await userQueries.getAll();
    roles.value = await userQueries.getRoles();
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
    fetch,
    create,
    updateRoles,
    disable,
    enable,
  };
});
