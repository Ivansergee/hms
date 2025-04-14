import type { Booking } from "@prisma/client";
import { prisma } from "@/../prisma/prisma";
import { BaseService } from "@/services/BaseService";
import type { BookingCreateDTO, BookingUpdateDTO } from "@/models/bookingModel";

export class BookingService extends BaseService<
    Booking,
    BookingCreateDTO,
    BookingUpdateDTO
> {
    constructor() {
        super(prisma.booking);
    }
}
