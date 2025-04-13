import type { Room } from "@prisma/client";
import { prisma } from "../../prisma/prisma";
import { BaseService } from "./BaseService";
import { RoomCreatePayload, RoomUpdatePayload } from "../../../shared/types/room";

export class RoomService extends BaseService<
    Room,
    RoomCreatePayload,
    RoomUpdatePayload
> {
    constructor() {
        super(prisma.room);
    }
}
