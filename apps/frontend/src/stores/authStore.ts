import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '@shared/types/user.ts';
import { Permission } from '@shared/enums/Permission.ts';
import { authQueries } from '@/queries/authQueries.ts';
import { initAuthenticatedStores } from '@/appBootstrap.ts';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User>();

  const initStoresForCurrentUser = async (): Promise<void> => {
    if (currentUser.value && !currentUser.value.mustChangePassword) {
      await initAuthenticatedStores();
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    currentUser.value = await authQueries.login(username, password);
    await initStoresForCurrentUser();
  };

  const logout = async (): Promise<void> => {
    await authQueries.logout();
    currentUser.value = undefined;
  };

  const restore = async (): Promise<void> => {
    try {
      currentUser.value = await authQueries.me();
      await initStoresForCurrentUser();
    } catch {
      currentUser.value = undefined;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const isChanged = await authQueries.changePassword(currentPassword, newPassword);
    if (isChanged?.success) {
      await logout();
    }
  };

  const updateProfile = async (data: { name: string; email?: string | null }): Promise<void> => {
    currentUser.value = await authQueries.updateProfile(data);
  };

  const hasPermission = (permission: Permission): boolean => (
    !!currentUser.value?.permissions.includes(Permission.ALL) || !!currentUser.value?.permissions.includes(permission)
  );

  return {
    currentUser,
    login,
    logout,
    restore,
    changePassword,
    updateProfile,
    hasPermission,
  };
});
