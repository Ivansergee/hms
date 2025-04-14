import { ref } from "vue";
import type { Room } from "@/types/Room.ts";
import { RoomStatus } from "@shared/generated/enums.ts"

export const rooms = ref<Room[]>([
  { id: 1, name: 'Room 1', category: 'DBL', status: RoomStatus.CLEAN },
  { id: 2, name: 'Room 2', category: 'DBL', status: RoomStatus.CLEAN },
  { id: 3, name: 'Room 3', category: 'DBL', status: RoomStatus.CLEAN },
  { id: 4, name: 'Room 4', category: 'DBL', status: RoomStatus.CLEAN },
  { id: 5, name: 'Room 5', category: 'DBL', status: RoomStatus.CLEAN },
  { id: 6, name: 'Room 6', category: 'DBL', status: RoomStatus.CLEAN },
  { id: 7, name: 'Room 7', category: 'DBL', status: RoomStatus.CLEAN },
  { id: 8, name: 'Room 8', category: 'DBL', status: RoomStatus.CLEAN },
]);
