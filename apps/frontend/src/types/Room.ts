import type { RoomStatus } from "../../../shared/enums/RoomStatus.ts";

export interface Room {
  id: number;
  name: string;
  category: string;
  status: RoomStatus;
}
