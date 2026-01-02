/*
  Warnings:

  - You are about to drop the column `folioItemId` on the `Payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_folioItemId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "folioItemId";

-- CreateTable
CREATE TABLE "_PaymentFolioItems" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PaymentFolioItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PaymentFolioItems_B_index" ON "_PaymentFolioItems"("B");

-- AddForeignKey
ALTER TABLE "_PaymentFolioItems" ADD CONSTRAINT "_PaymentFolioItems_A_fkey" FOREIGN KEY ("A") REFERENCES "FolioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentFolioItems" ADD CONSTRAINT "_PaymentFolioItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
