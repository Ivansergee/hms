import { Booking, Prisma } from "@prisma/client";
import { prisma } from "@/../prisma/prisma";
import type { BookingFilterDTO } from "@/models/bookingModel";
import { BookingCreate } from "@shared/types/booking";

export class BookingService {
    getAll(): Promise<Booking[]> {
        return prisma.booking.findMany();
    }

    getById(id: number): Promise<Booking | null> {
        return prisma.booking.findUnique({ where: { id } });
    }

    delete(id: number): Promise<Booking> {
        return prisma.booking.delete({ where: { id } });
    }
    create(bookingData: BookingCreate): Promise<Booking> {
        return prisma.$transaction(async (tx) => {
            const createdGuests = await Promise.all(
                bookingData.guests.map(guest =>
                    tx.guest.create({
                        data: {
                            firstName: guest.firstName,
                            lastName: guest.lastName,
                            parentName: guest.parentName,
                            gender: guest.gender,
                            birthdate: guest.birthdate,
                            phone: guest.phone,
                            email: guest.email,
                            citizenship: guest.citizenship,
                        },
                    })
                )
            );

            const mainGuest = createdGuests[0];

            return tx.booking.create({
                data: {
                    start: bookingData.start,
                    end: bookingData.end,
                    room: { connect: { id: bookingData.roomId } },
                    mainGuest: { connect: { id: mainGuest.id } },
                    guests: {
                        connect: createdGuests.map(g => ({ id: g.id })),
                    },
                },
                include: {
                    mainGuest: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });
        });
    }

    getDetails(id: number) {
        return prisma.booking.findUnique({
            relationLoadStrategy: 'join',
            where: { id },
            omit: {
                guestId: true,
            },
            include: {
                guests: true,
                mainGuest: {
                    select: { id: true},
                },
            },
        }).then((booking) => {
            if (!booking) {
                throw new Error('Booking not found.');
            }
            const { mainGuest, ...result } = {
                ...booking,
                mainGuestId: booking.mainGuest.id,
            };
            return result;
        });
    }

    filter(filter: BookingFilterDTO) {
        const where: Prisma.BookingWhereInput = {};

        if (filter.start && filter.end) {
            where.AND = [
                { end: { gte: new Date(filter.start) } },
                { start: { lte: new Date(filter.end) } },
            ];
        } else if (filter.start) {
            where.start = new Date(filter.start);
        } else if (filter.end) {
            where.end = new Date(filter.end);
        }

        if (filter.roomId) {
            where.roomId = filter.roomId;
        }

        if (filter.status) {
            where.status = filter.status;
        }

        if (filter.guestId) {
            where.guests = {
                some: { id: filter.guestId },
            };
        }

        return prisma.booking.findMany({
            where,
            include: {
                mainGuest: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }
}
