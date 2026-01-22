/*
  Warnings:

  - You are about to drop the column `end` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `checkInDate` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkOutDate` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "end",
DROP COLUMN "start",
ADD COLUMN     "arrivalTime" TIMESTAMP(3),
ADD COLUMN     "checkInDate" DATE NOT NULL,
ADD COLUMN     "checkOutDate" DATE NOT NULL,
ADD COLUMN     "departureTime" TIMESTAMP(3);
