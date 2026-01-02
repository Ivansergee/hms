/*
  Warnings:

  - You are about to drop the column `paymentId` on the `FolioItem` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PAYMENT', 'REFUND');

-- DropForeignKey
ALTER TABLE "FolioItem" DROP CONSTRAINT "FolioItem_paymentId_fkey";

-- AlterTable
ALTER TABLE "FolioItem" DROP COLUMN "paymentId",
ADD COLUMN     "transactionId" INTEGER;

-- DropTable
DROP TABLE "Payment";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "type" "TransactionType" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FolioItem" ADD CONSTRAINT "FolioItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
