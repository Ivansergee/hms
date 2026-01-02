import type { RoomStatus } from "@shared/enums/RoomStatus";

export interface Room {
  id: number;
  name: string;
  category: string;
  status: RoomStatus;
}
