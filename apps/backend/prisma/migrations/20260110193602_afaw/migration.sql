/*
  Warnings:

  - You are about to drop the column `arrivalTime` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `departureTime` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `arrivalMinutes` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureMinutes` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "arrivalTime",
DROP COLUMN "departureTime",
ADD COLUMN     "arrivalMinutes" INTEGER NOT NULL,
ADD COLUMN     "departureMinutes" INTEGER NOT NULL;
