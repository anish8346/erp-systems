-- AlterTable
ALTER TABLE "SalesOrder" ADD COLUMN     "customerAddress" TEXT,
ADD COLUMN     "salesPersonId" TEXT;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_salesPersonId_fkey" FOREIGN KEY ("salesPersonId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
