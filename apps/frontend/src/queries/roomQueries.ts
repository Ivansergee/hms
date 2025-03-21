import {ref} from "vue";
import type {RoomData} from "@/utils/planTableUtils.ts";

export const rooms = ref<RoomData[]>([
  { id: 1, name: 'Room 1' },
  { id: 2, name: 'Room 2' },
  { id: 3, name: 'Room 3' },
  { id: 4, name: 'Room 4' },
  { id: 5, name: 'Room 5' },
  { id: 6, name: 'Room 6' },
  { id: 7, name: 'Room 7' },
  { id: 8, name: 'Room 8' },
]);
