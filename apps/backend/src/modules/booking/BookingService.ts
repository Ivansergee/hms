import { Booking, BookingGuestRole, Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/prisma";
import { BookingFilterDTO } from "@/modules/booking/BookingModel";
import { BookingCreate, BookingDetails, BookingPlacement, BookingShort } from "@shared/types/booking";
import { BookingStatus } from "@shared/enums/BookingStatus";
import type {
    BookingGuest,
    BookingGuestSnapshotCreate,
    BookingGuestSnapshotUpdate,
} from "@shared/types/bookingGuest";
import { bookingDbQueries } from "@/dbQueries/bookingDbQueries";
import { bookingFormatter } from "@/formatters/bookingFormatter";
import { bookingGuestFormatter } from "@/formatters/bookingGuestFormatter";
import { formatDate, parseDateOnly } from "@/utils/dateUtils";

const bookingGuestShortSelect = {
    id: true,
    guestId: true,
    role: true,
    firstName: true,
    lastName: true,
} satisfies Prisma.BookingGuestSelect;

const bookingShortInclude = {
    guests: {
        select: bookingGuestShortSelect,
    },
} satisfies Prisma.BookingInclude;

type BookingShortRaw = Prisma.BookingGetPayload<{ include: typeof bookingShortInclude }>;

function normalizeSnapshotUpdate(data: BookingGuestSnapshotUpdate): Prisma.BookingGuestUpdateInput {
    return {
        ...data,
        birthdate: typeof data.birthdate === 'string'
            ? parseDateOnly(data.birthdate)
            : data.birthdate,
    };
}

function formatBookingShort(booking: BookingShortRaw): BookingShort {
    return {
        id: booking.id,
        roomId: booking.roomId,
        checkInDate: formatDate(booking.checkInDate),
        checkOutDate: formatDate(booking.checkOutDate),
        arrivalMinutes: booking.arrivalMinutes,
        departureMinutes: booking.departureMinutes,
        status: booking.status as BookingStatus,
        guests: booking.guests.map(guest => bookingGuestFormatter.formatBookingGuestShort(guest)),
    };
}

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

    async create(bookingData: BookingCreate): Promise<BookingShort> {
        const { guests, mainGuestIndex } = bookingData;

        if (!guests.length) {
            throw new Error('At least one guest is required');
        }

        if (mainGuestIndex < 0 || mainGuestIndex >= guests.length) {
            throw new Error('Invalid main guest');
        }

        return prisma.$transaction(async (tx) => {
            const bookingGuests: Prisma.BookingGuestCreateWithoutBookingInput[] = [];

            for (const [index, guest] of guests.entries()) {
                const role = index === mainGuestIndex ? BookingGuestRole.MAIN : BookingGuestRole.ACCOMPANYING;
                const existingGuest = guest.guestId === undefined
                    ? null
                    : await tx.guest.findUnique({
                        where: { id: guest.guestId },
                        select: { id: true },
                    });

                if (guest.guestId !== undefined && !existingGuest) {
                    throw new Error('Guest not found');
                }

                bookingGuests.push({
                    ...(existingGuest && { guest: { connect: { id: existingGuest.id } } }),
                    role,
                    firstName: guest.firstName,
                    lastName: guest.lastName,
                    parentName: guest.parentName,
                    gender: guest.gender,
                    birthdate: guest.birthdate
                        ? parseDateOnly(guest.birthdate)
                        : undefined,
                    phone: guest.phone,
                    email: guest.email,
                    citizenship: guest.citizenship,
                });
            }

            const createdBooking = await tx.booking.create({
                data: {
                    checkInDate: parseDateOnly(bookingData.checkInDate),
                    checkOutDate: parseDateOnly(bookingData.checkOutDate),
                    arrivalMinutes: bookingData.arrivalMinutes,
                    departureMinutes: bookingData.departureMinutes,

                    room: {
                        connect: { id: bookingData.roomId },
                    },

                    guests: {
                        create: bookingGuests,
                    },

                    folios: {
                        create: [{}],
                    },
                },
                include: bookingShortInclude,
            });

            return formatBookingShort(createdBooking);
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

    async filter(filter: BookingFilterDTO): Promise<BookingShort[]> {
        const where: Prisma.BookingWhereInput = {};

        if (filter.checkInDate && filter.checkOutDate) {
            where.AND = [
                { checkOutDate: { gte: parseDateOnly(filter.checkInDate) } },
                { checkInDate: { lte: parseDateOnly(filter.checkOutDate) } },
            ];
        } else if (filter.checkInDate) {
            where.checkInDate = parseDateOnly(filter.checkInDate);
        } else if (filter.checkOutDate) {
            where.checkOutDate = parseDateOnly(filter.checkOutDate);
        }

        if (filter.roomId) {
            where.roomId = filter.roomId;
        }

        if (filter.status) {
            where.status = filter.status;
        }

        if (filter.guestId) {
            where.guests = {
                some: { guestId: filter.guestId },
            };
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: bookingShortInclude,
        });

        return bookings.map(formatBookingShort);
    }

    async editPlacement(id: number, data: BookingPlacement): Promise<BookingShort> {
        const checkInDate = parseDateOnly(data.checkInDate);
        const checkOutDate = parseDateOnly(data.checkOutDate);

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                ...data,
                checkInDate,
                checkOutDate,
            },
            include: bookingShortInclude,
        });

        return formatBookingShort(updatedBooking);
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

    async linkBookingGuest(bookingId: number, bookingGuestId: number, guestId: number): Promise<BookingGuest> {
        return prisma.$transaction(async (tx) => {
            const [bookingGuest, guest] = await Promise.all([
                tx.bookingGuest.findFirst({
                    where: { id: bookingGuestId, bookingId },
                }),
                tx.guest.findUnique({
                    where: { id: guestId },
                }),
            ]);

            if (!bookingGuest) {
                throw new Error('Booking guest not found');
            }

            if (!guest) {
                throw new Error('Guest not found');
            }

            const updatedBookingGuest = await tx.bookingGuest.update({
                where: { id: bookingGuestId },
                data: {
                    guest: { connect: { id: guest.id } },
                },
            });

            return bookingGuestFormatter.formatBookingGuest(updatedBookingGuest);
        });
    }

    async createBookingGuestSnapshot(bookingId: number, data: BookingGuestSnapshotCreate): Promise<BookingGuest> {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: { id: true },
        });

        if (!booking) {
            throw new Error('Booking not found');
        }

        const bookingGuest = await prisma.bookingGuest.create({
            data: {
                booking: { connect: { id: booking.id } },
                role: BookingGuestRole.ACCOMPANYING,
                firstName: data.firstName,
                lastName: data.lastName,
                parentName: data.parentName,
                gender: data.gender,
                birthdate: data.birthdate
                    ? parseDateOnly(data.birthdate)
                    : undefined,
                phone: data.phone,
                email: data.email,
                citizenship: data.citizenship,
            },
        });

        return bookingGuestFormatter.formatBookingGuest(bookingGuest);
    }

    async createGuestFromBookingGuest(bookingId: number, bookingGuestId: number): Promise<BookingGuest> {
        return prisma.$transaction(async (tx) => {
            const bookingGuest = await tx.bookingGuest.findFirst({
                where: { id: bookingGuestId, bookingId },
            });

            if (!bookingGuest) {
                throw new Error('Booking guest not found');
            }

            if (bookingGuest.guestId) {
                return bookingGuestFormatter.formatBookingGuest(bookingGuest);
            }

            const guest = await tx.guest.create({
                data: {
                    firstName: bookingGuest.firstName,
                    lastName: bookingGuest.lastName,
                    parentName: bookingGuest.parentName,
                    gender: bookingGuest.gender,
                    birthdate: bookingGuest.birthdate,
                    phone: bookingGuest.phone,
                    email: bookingGuest.email,
                    citizenship: bookingGuest.citizenship,
                },
            });

            const updatedBookingGuest = await tx.bookingGuest.update({
                where: { id: bookingGuestId },
                data: {
                    guest: { connect: { id: guest.id } },
                },
            });

            return bookingGuestFormatter.formatBookingGuest(updatedBookingGuest);
        });
    }

    async updateBookingGuestSnapshot(
        bookingId: number,
        bookingGuestId: number,
        data: BookingGuestSnapshotUpdate,
    ): Promise<BookingGuest> {
        const bookingGuest = await prisma.bookingGuest.findFirst({
            where: { id: bookingGuestId, bookingId },
        });

        if (!bookingGuest) {
            throw new Error('Booking guest not found');
        }

        if (bookingGuest.guestId !== null) {
            throw new Error('Unlink the guest profile before editing the booking snapshot');
        }

        const updatedBookingGuest = await prisma.bookingGuest.update({
            where: { id: bookingGuestId },
            data: normalizeSnapshotUpdate(data),
        });

        return bookingGuestFormatter.formatBookingGuest(updatedBookingGuest);
    }

    async unlinkBookingGuest(bookingId: number, bookingGuestId: number): Promise<BookingGuest> {
        const bookingGuest = await prisma.bookingGuest.findFirst({
            where: { id: bookingGuestId, bookingId },
        });

        if (!bookingGuest) {
            throw new Error('Booking guest not found');
        }

        const updatedBookingGuest = await prisma.bookingGuest.update({
            where: { id: bookingGuestId },
            data: { guest: { disconnect: true } },
        });

        return bookingGuestFormatter.formatBookingGuest(updatedBookingGuest);
    }

    async deleteBookingGuestSnapshot(bookingId: number, bookingGuestId: number): Promise<boolean> {
        return prisma.$transaction(async (tx) => {
            const guests = await tx.bookingGuest.findMany({
                where: { bookingId },
                orderBy: { id: 'asc' },
            });
            const bookingGuest = guests.find(guest => guest.id === bookingGuestId);

            if (!bookingGuest) {
                throw new Error('Booking guest not found');
            }

            if (guests.length === 1) {
                throw new Error('At least one booking guest is required');
            }

            await tx.bookingGuest.delete({
                where: { id: bookingGuestId },
            });

            if (bookingGuest.role === BookingGuestRole.MAIN) {
                const nextMainGuest = guests.find(guest => guest.id !== bookingGuestId);

                if (nextMainGuest) {
                    await tx.bookingGuest.update({
                        where: { id: nextMainGuest.id },
                        data: { role: BookingGuestRole.MAIN },
                    });
                }
            }

            return true;
        });
    }
}
