import type { Guest, GuestCreate } from '@shared/types/guest.ts';
import fetcher from '@/queries/fetcher.ts';

export const guestQueries = {
  fetch(): Promise<Guest[]> {
    return fetcher.get<Guest[]>('/guest');
  },

  search(q?: string): Promise<Guest[]> {
    return fetcher.get<Guest[]>('/guest/search', q ? { q } : undefined);
  },

  create(guestData: GuestCreate): Promise<Guest> {
    return fetcher.post<Guest>('/guest', guestData);
  },
};
