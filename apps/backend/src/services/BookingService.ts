import { Booking, Prisma } from "@prisma/client";
import { prisma } from "@/../prisma/prisma";
import { BookingFilterDTO } from "@/models/bookingModel";
import { BookingCreate, BookingDetails, BookingEditPlacement, BookingShort } from "@shared/types/booking";
import { BookingStatus } from "@shared/generated/enums";
import { bookingDbQueries } from "@/dbQueries/bookingDbQueries";
import { bookingFormatter } from "@/formatters/bookingFormatter";

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

    // update(id: number, data: Partial<BookingUpdate>): Promise<Booking> {
    //     return prisma.booking.update({ where: { id }, data });
    // }

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
                    folios: {
                        create: [{}],
                    },
                },
                include: {
                    guests: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        }
                    },
                },
            });
        });
    }

    async getDetails(id: number): Promise<BookingDetails> {
        const bookingDetailsRaw = await prisma.booking.findUnique({
            relationLoadStrategy: 'join',
            where: { id },
            ...bookingDbQueries.details,
        })

        if (!bookingDetailsRaw) {
            throw new Error('Booking not found.');
        }

        return bookingFormatter.formatDetails(bookingDetailsRaw);
    }

    async filter(filter: BookingFilterDTO) {
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
            omit: {
                createdAt: true,
                updatedAt: true,
            },
            include: {
                guests: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    }
                },
            },
        });
    }

    async editPlacement(id: number, data: BookingEditPlacement): Promise<BookingShort> {
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data,
            include: {
                guests: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    }
                },
            },
        });
        return {
            ...updatedBooking,
            status: updatedBooking.status as BookingStatus,
            start: updatedBooking.start.toISOString(),
            end: updatedBooking.end.toISOString(),
        };
    }
}
