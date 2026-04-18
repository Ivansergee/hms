import type { Room } from "@/types/Room";
import fetcher from "@/queries/fetcher";
import type { Category } from "@shared/types/category.ts";

export const roomQueries = {
  getAllRooms(): Promise<Room[]> {
    return fetcher.get<Room[]>('/room');
  },
  getAllCategories(): Promise<Category[]> {
    return fetcher.get<Category[]>('/category');
  },
  getAvailableIds(start: string, end: string): Promise<number[]> {
    return fetcher.get<number[]>('/room/availableIds', { start, end });
  }
};
