import { RoomStatus } from "../enums/RoomStatus";

export interface RoomCreatePayload{
    name: string;
    categoryId: number;
    status?: RoomStatus;
}

export type RoomUpdatePayload = Partial<RoomCreatePayload>;