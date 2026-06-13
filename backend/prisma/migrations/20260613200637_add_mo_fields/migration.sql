/*
  Warnings:

  - You are about to drop the column `duration` on the `WorkOrder` table. All the data in the column will be lost.
  - Added the required column `expectedDuration` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_operationId_fkey";

-- AlterTable
ALTER TABLE "ManufacturingOrder" ADD COLUMN     "assigneeId" TEXT;

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "duration",
ADD COLUMN     "expectedDuration" INTEGER NOT NULL,
ADD COLUMN     "operationName" TEXT,
ADD COLUMN     "realDuration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "workCenterId" TEXT,
ALTER COLUMN "operationId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "MOComponent" (
    "id" TEXT NOT NULL,
    "moId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "toConsume" DOUBLE PRECISION NOT NULL,
    "consumed" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "MOComponent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ManufacturingOrder" ADD CONSTRAINT "ManufacturingOrder_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MOComponent" ADD CONSTRAINT "MOComponent_moId_fkey" FOREIGN KEY ("moId") REFERENCES "ManufacturingOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MOComponent" ADD CONSTRAINT "MOComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_workCenterId_fkey" FOREIGN KEY ("workCenterId") REFERENCES "WorkCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
