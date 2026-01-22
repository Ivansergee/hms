import { Booking, Prisma } from "@prisma/client";
import { prisma } from "@/../prisma/prisma";
import { BookingFilterDTO } from "@/models/bookingModel";
import { BookingCreate, BookingDetails, BookingEditPlacement, BookingShort } from "@shared/types/booking";
import { BookingStatus } from "@shared/enums/BookingStatus";
import { bookingDbQueries } from "@/dbQueries/bookingDbQueries";
import { bookingFormatter } from "@/formatters/bookingFormatter";
import { formatDate, formatDateTime } from "@/utils/dateUtils";

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
                    checkInDate: new Date(bookingData.checkInDate),
                    checkOutDate: new Date(bookingData.checkOutDate),
                    arrivalMinutes: bookingData.arrivalMinutes,
                    departureMinutes: bookingData.departureMinutes,
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

    async editPlacement(id: number, data: BookingEditPlacement): Promise<BookingShort> {
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
}
