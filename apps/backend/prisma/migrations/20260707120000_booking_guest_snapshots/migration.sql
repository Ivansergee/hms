-- CreateEnum
CREATE TYPE "BookingGuestRole" AS ENUM ('MAIN', 'ACCOMPANYING');

-- CreateTable
CREATE TABLE "BookingGuest" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "guestId" INTEGER,
    "role" "BookingGuestRole" NOT NULL DEFAULT 'ACCOMPANYING',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "parentName" TEXT,
    "gender" "Gender",
    "birthdate" DATE,
    "phone" TEXT,
    "email" TEXT,
    "citizenship" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingGuest_pkey" PRIMARY KEY ("id")
);

-- Copy existing booking/guest links into historical booking snapshots.
INSERT INTO "BookingGuest" (
    "bookingId",
    "guestId",
    "role",
    "firstName",
    "lastName",
    "parentName",
    "gender",
    "birthdate",
    "phone",
    "email",
    "citizenship",
    "createdAt",
    "updatedAt"
)
SELECT
    bg."A",
    bg."B",
    CASE WHEN b."mainGuestId" = bg."B" THEN 'MAIN'::"BookingGuestRole" ELSE 'ACCOMPANYING'::"BookingGuestRole" END,
    g."firstName",
    g."lastName",
    g."parentName",
    g."gender",
    g."birthdate",
    g."phone",
    g."email",
    g."citizenship",
    b."createdAt",
    b."updatedAt"
FROM "_BookingGuests" bg
JOIN "Booking" b ON b."id" = bg."A"
JOIN "Guest" g ON g."id" = bg."B";

-- CreateIndex
CREATE UNIQUE INDEX "BookingGuest_bookingId_guestId_key" ON "BookingGuest"("bookingId", "guestId");

-- CreateIndex
CREATE INDEX "BookingGuest_guestId_idx" ON "BookingGuest"("guestId");

-- One main guest per booking.
CREATE UNIQUE INDEX "BookingGuest_one_main_per_booking_idx"
ON "BookingGuest"("bookingId")
WHERE "role" = 'MAIN';

-- AddForeignKey
ALTER TABLE "BookingGuest" ADD CONSTRAINT "BookingGuest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingGuest" ADD CONSTRAINT "BookingGuest_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_mainGuestId_fkey";

-- DropForeignKey
ALTER TABLE "_BookingGuests" DROP CONSTRAINT "_BookingGuests_A_fkey";

-- DropForeignKey
ALTER TABLE "_BookingGuests" DROP CONSTRAINT "_BookingGuests_B_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "mainGuestId";

-- DropTable
DROP TABLE "_BookingGuests";
