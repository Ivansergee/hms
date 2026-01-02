import type { Room } from "@/types/Room";
import fetcher from "@/queries/fetcher";

export const roomQueries = {
  getAll(): Promise<Room[]> {
    return fetcher.get<Room[]>('/room');
  },
  getAvailableIds(start: string, end: string): Promise<number[]> {
    return fetcher.get<number[]>('/room/availableIds', { start, end });
  }
};
