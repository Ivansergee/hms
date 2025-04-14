import type { RoomStatus } from "@shared/generated/enums.ts";

export interface Room {
  id: number;
  name: string;
  category: string;
  status: RoomStatus;
}
