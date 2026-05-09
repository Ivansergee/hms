import { Booking, Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/prisma";
import { BookingFilterDTO } from "@/modules/booking/BookingModel";
import { BookingCreate, BookingDetails, BookingPlacement, BookingShort } from "@shared/types/booking";
import { BookingStatus } from "@shared/enums/BookingStatus";
import { bookingDbQueries } from "@/dbQueries/bookingDbQueries";
import { bookingFormatter } from "@/formatters/bookingFormatter";
import { formatDate } from "@/utils/dateUtils";
import { isExistingGuest } from "@/utils/utils";

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

    async create(bookingData: BookingCreate): Promise<Booking> {
        const { guests, mainGuestIndex } = bookingData;

        if (!guests.length) {
            throw new Error('At least one guest is required');
        }

        return prisma.$transaction(async (tx) => {
            const guestIds: number[] = [];

            for (const guest of guests) {
                if (isExistingGuest(guest)) {
                    guestIds.push(guest.id);
                } else {
                    const created = await tx.guest.create({
                        data: {
                            ...guest,
                            birthdate: guest.birthdate
                                ? new Date(guest.birthdate + 'T00:00:00')
                                : undefined,
                        },
                    });
                    guestIds.push(created.id);
                }
            }

            const mainGuestId = guestIds[mainGuestIndex];

            if (!mainGuestId) {
                throw new Error('Invalid main guest');
            }

            return tx.booking.create({
                data: {
                    checkInDate: new Date(bookingData.checkInDate),
                    checkOutDate: new Date(bookingData.checkOutDate),
                    arrivalMinutes: bookingData.arrivalMinutes,
                    departureMinutes: bookingData.departureMinutes,

                    room: {
                        connect: { id: bookingData.roomId },
                    },

                    mainGuest: {
                        connect: { id: mainGuestId },
                    },

                    guests: {
                        connect: guestIds.map(id => ({ id })),
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
                        },
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

        if (filter.checkInDate && filter.checkOutDate) {
            where.AND = [
                { checkOutDate: { gte: new Date(filter.checkInDate) } },
                { checkInDate: { lte: new Date(filter.checkOutDate) } },
            ];
        } else if (filter.checkInDate) {
            where.checkInDate = new Date(filter.checkInDate);
        } else if (filter.checkOutDate) {
            where.checkOutDate = new Date(filter.checkOutDate);
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

        const bookings = await prisma.booking.findMany({
            where,
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

        return bookings.map(booking => ({
            ...booking,
            checkInDate: formatDate(booking.checkInDate),
            checkOutDate: formatDate(booking.checkOutDate),
        }));
    }

    async editPlacement(id: number, data: BookingPlacement): Promise<BookingShort> {
        const checkInDate = new Date(`${data.checkInDate}T00:00:00Z`);
        const checkOutDate = new Date(`${data.checkOutDate}T00:00:00Z`);

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                ...data,
                checkInDate,
                checkOutDate,
            },
            include: {
                guests: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return {
            ...updatedBooking,
            status: updatedBooking.status as BookingStatus,
            checkInDate: formatDate(updatedBooking.checkInDate),
            checkOutDate: formatDate(updatedBooking.checkOutDate),
            arrivalMinutes: updatedBooking.arrivalMinutes,
            departureMinutes: updatedBooking.departureMinutes,
        };
    }

    async setStatus(id: number, status: BookingStatus): Promise<BookingStatus> {
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                status,
            },
        });
        return updatedBooking.status as BookingStatus;
    }
}
