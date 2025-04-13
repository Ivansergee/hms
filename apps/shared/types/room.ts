import { RoomStatus } from "../generated/enums";

export interface RoomCreatePayload{
    name: string;
    categoryId: number;
    status?: RoomStatus;
}

export type RoomUpdatePayload = Partial<RoomCreatePayload>;