import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Room, RoomWithCategory } from "@/types/Room";
import { roomQueries } from "@/queries/roomQueries";
import type { Category } from "@shared/types/category.ts";
import type { RoomStatus } from "@shared/enums/RoomStatus.ts";

export const useRoomStore = defineStore('rooms', () => {
  const rooms = ref<Room[]>([]);
  const categories = ref<Category[]>([]);
  const roomsWithCategory = computed<RoomWithCategory[]>(() => {
    return rooms.value.map(room => ({
      id: room.id,
      name: room.name,
      status: room.status,
      category: categories.value.find((category) => category.id === room.categoryId),
    }));
  });

  const fetch = async () => {
    rooms.value = await roomQueries.getAllRooms();
    categories.value = await roomQueries.getAllCategories();
  };

  const getById = (id: number): Room | undefined => {
    return rooms.value.find(room => room.id === id);
  };

  const getCategoryById = (id: number): Category | undefined => {
    return categories.value.find(category => category.id === id);
  }

  const getAvailableRooms = async (start: string, end: string): Promise<RoomWithCategory[]> => {
    const ids = await roomQueries.getAvailableIds(start, end);
    return roomsWithCategory.value.filter(room => ids.includes(room.id));
  };

  const setStatus = async (id: number, status: RoomStatus): Promise<void> => {
    const room = rooms.value.find(r => r.id === id);
    if (!room) {
      return;
    }

    const previousStatus = room.status;
    room.status = status;

    try {
      await roomQueries.setStatus(id, status);
    } catch (error) {
      room.status = previousStatus;
      console.error("Failed to update status, rolling back...", error);
      // message.error("Failed to update room status");
    }
  };

  return {
    rooms,
    categories,
    roomsWithCategory,
    fetch,
    getById,
    getAvailableRooms,
    getCategoryById,
    setStatus,
  };
});
