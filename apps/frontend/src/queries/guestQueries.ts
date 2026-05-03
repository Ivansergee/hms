import type { Guest, GuestCreate } from '@shared/types/guest.ts';
import fetcher from '@/queries/fetcher.ts';

export const guestQueries = {
  create(guestData: GuestCreate): Promise<Guest> {
    return fetcher.post<Guest>('/guest', guestData);
  },
};
