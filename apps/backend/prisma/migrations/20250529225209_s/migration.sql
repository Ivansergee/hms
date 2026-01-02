/*
  Warnings:

  - You are about to drop the column `amount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `folioId` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `folioItemId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `method` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_folioId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "amount",
DROP COLUMN "folioId",
ADD COLUMN     "folioItemId" INTEGER NOT NULL,
DROP COLUMN "method",
ADD COLUMN     "method" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_folioItemId_fkey" FOREIGN KEY ("folioItemId") REFERENCES "FolioItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
