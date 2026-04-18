import { defineStore } from "pinia";
import { ref } from "vue";
import type { Room } from "@/types/Room";
import { roomQueries } from "@/queries/roomQueries";
import type { Category } from "@shared/types/category.ts";

export const useRoomStore = defineStore('rooms', () => {
  const rooms = ref<Room[]>([]);
  const categories = ref<Category[]>([]);

  const fetch = async () => {
    rooms.value = await roomQueries.getAllRooms();
    categories.value = await roomQueries.getAllCategories();
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
    categories,
    fetch,
    getById,
    getAvailableRooms,
  };
});
