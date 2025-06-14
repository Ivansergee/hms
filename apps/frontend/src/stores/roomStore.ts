import { defineStore } from "pinia";
import { ref } from "vue";
import type { Room } from "@/types/Room.ts";
import { roomQueries } from "@/queries/roomQueries.ts";

export const useRoomStore = defineStore('rooms', () => {
  const rooms = ref<Room[]>([]);

  const fetch = async () => {
    rooms.value = await roomQueries.getAll();
  };

  const getById = (id: number): Room | undefined => {
    return rooms.value.find(room => room.id === id);
  };

  const getAvailableRooms = async (start: string, end: string): Promise<Room[]> => {
    const ids = await roomQueries.getAvailableIds(start, end);
    return rooms.value.filter(room => ids.includes(room.id));
  };

  return {
    rooms,
    fetch,
    getById,
    getAvailableRooms,
  };
});
