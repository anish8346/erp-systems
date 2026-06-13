-- AlterTable
ALTER TABLE "Operation" ADD COLUMN     "bomId" TEXT;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "BoM"("id") ON DELETE SET NULL ON UPDATE CASCADE;
