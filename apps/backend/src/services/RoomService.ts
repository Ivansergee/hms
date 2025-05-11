import type { Room } from "@prisma/client";
import { prisma } from "@/../prisma/prisma";
import { BaseService } from "@/services/BaseService";
import { RoomCreatePayload, RoomUpdatePayload } from "@shared/types/room";

export class RoomService extends BaseService<
    Room,
    RoomCreatePayload,
    RoomUpdatePayload
> {
    constructor() {
        super(prisma.room);
    }
    async getAvailableIds(start: string, end: string): Promise<number[]> {
        const overlappingBookings = await prisma.booking.findMany({
            where: {
                start: { lt: new Date(end) },
                end: { gt: new Date(start) },
            },
            select: { roomId: true },
        });
        const takenRoomIds = [...new Set(overlappingBookings.map(b => b.roomId))];
        const availableRooms = await prisma.room.findMany({
            where: {
                id: {
                    notIn: takenRoomIds,
                },
            },
            select: { id: true },
        });

        return availableRooms.map(room => room.id);
    }
}
