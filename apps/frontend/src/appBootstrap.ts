import { useRoomStore } from '@/stores/roomStore';
import { useServiceStore } from '@/stores/serviceStore';

export async function initAuthenticatedStores(): Promise<void> {
  await Promise.all([
    useRoomStore().fetch(),
    useServiceStore().fetch(),
  ]);
}
