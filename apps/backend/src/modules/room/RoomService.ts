import type { Room } from "@prisma/client";
import { prisma } from "../../../prisma/prisma";
import { RoomCreatePayload, RoomUpdatePayload } from "@shared/types/room";
import { RoomStatus } from "@shared/enums/RoomStatus";

export class RoomService {
    getAll(): Promise<Room[]> {
        return prisma.room.findMany();
    }

    getById(id: number): Promise<Room | null> {
        return prisma.room.findUnique({ where: { id } });
    }

    create(data: RoomCreatePayload): Promise<Room> {
        return prisma.room.create({ data });
    }

    update(id: number, data: RoomUpdatePayload): Promise<Room> {
        return prisma.room.update({ where: { id }, data });
    }

    delete(id: number): Promise<Room> {
        return prisma.room.delete({ where: { id } });
    }

    async getAvailableIds(start: string, end: string): Promise<number[]> {
        const overlappingBookings = await prisma.booking.findMany({
            where: {
                checkInDate: { lt: new Date(end) },
                checkOutDate: { gt: new Date(start) },
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

    async setStatus(id: number, status: RoomStatus): Promise<RoomStatus> {
        const updatedRoom = await prisma.room.update({
            where: { id },
            data: {
                status,
            },
        });
        return updatedRoom.status as RoomStatus;
    }
}
