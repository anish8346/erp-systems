-- AlterTable
ALTER TABLE "SalesOrderLine" ADD COLUMN     "initialPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SalesOrderComment" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesOrderComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalesOrderComment" ADD CONSTRAINT "SalesOrderComment_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderComment" ADD CONSTRAINT "SalesOrderComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
