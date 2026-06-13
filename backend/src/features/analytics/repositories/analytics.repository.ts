import prisma from '../../../core/database/prisma.js';

export class AnalyticsRepository {
  static async getAllSalesLines() {
    return await prisma.salesOrderLine.findMany();
  }

  static async getAllPurchaseLines() {
    return await prisma.purchaseOrderLine.findMany();
  }
}
