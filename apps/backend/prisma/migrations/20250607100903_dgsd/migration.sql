/*
  Warnings:

  - You are about to drop the `_PaymentFolioItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PaymentFolioItems" DROP CONSTRAINT "_PaymentFolioItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_PaymentFolioItems" DROP CONSTRAINT "_PaymentFolioItems_B_fkey";

-- AlterTable
ALTER TABLE "FolioItem" ADD COLUMN     "paymentId" INTEGER;

-- DropTable
DROP TABLE "_PaymentFolioItems";

-- AddForeignKey
ALTER TABLE "FolioItem" ADD CONSTRAINT "FolioItem_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
