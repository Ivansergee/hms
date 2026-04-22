import type { RoomStatus } from "@shared/enums/RoomStatus";
import type { Category } from "@shared/types/category.ts";

export interface Room {
  id: number;
  name: string;
  categoryId: number;
  status: RoomStatus;
}

export interface RoomWithCategory extends Omit<Room, 'categoryId'> {
  category?: Category;
}
