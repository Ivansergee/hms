import fetcher from '@/queries/fetcher.ts';
import type { User } from '@shared/types/user.ts';

export const authQueries = {
  login(username: string, password: string): Promise<User> {
    return fetcher.post('/auth/login', { username, password });
  },

  logout(): Promise<void> {
    return fetcher.post('/auth/logout', {});
  },

  me(): Promise<User> {
    return fetcher.get('/auth/me');
  },

  changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return fetcher.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
};
