import type { Room } from "@/types/Room.ts";
import fetcher from "@/queries/fetcher.ts";

export const roomQueries = {
  getAll(): Promise<Room[]> {
    return fetcher.get<Room[]>('/room');
  },
  getAvailableIds(start: string, end: string): Promise<number[]> {
    return fetcher.get<number[]>('/room/availableIds', { start, end });
  }
};
