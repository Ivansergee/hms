import { useRoomStore } from '@/stores/roomStore';
import { useServiceStore } from '@/stores/serviceStore';
import { useUserStore } from '@/stores/userStore.ts';

export async function initAuthenticatedStores(): Promise<void> {
  await Promise.all([
    useRoomStore().fetch(),
    useServiceStore().fetch(),
    useUserStore().fetch(),
  ]);
}
