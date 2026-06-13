import prisma from '../../../core/database/prisma.js';

export class ProcurementRepository {
  static async createPurchaseOrder(data: any) {
    const { vendorId, vendorName, orderLines } = data;
    const totalAmount = orderLines.reduce((acc: number, line: any) => acc + (line.quantity * line.price), 0);
    
    return await prisma.purchaseOrder.create({
      data: {
        vendorId,
        vendorName,
        status: 'DRAFT',
        totalAmount,
        orderLines: {
          create: orderLines.map((line: any) => ({
            productId: line.productId,
            quantity: Number(line.quantity),
            price: Number(line.price),
          })),
        },
      },
      include: { orderLines: true },
    });
  }

  static async findPurchaseOrderById(id: string) {
    return await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { orderLines: true },
    });
  }

  static async getPurchaseOrders() {
    return await prisma.purchaseOrder.findMany({
      include: { orderLines: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createVendor(data: { name: string, email?: string, phone?: string, address?: string }) {
    return await prisma.vendor.create({
      data
    });
  }

  static async getVendors() {
    return await prisma.vendor.findMany({
      orderBy: { name: 'asc' }
    });
  }

  static async updateVendor(id: string, data: { name?: string, email?: string, phone?: string, address?: string }) {
    return await prisma.vendor.update({
      where: { id },
      data
    });
  }

  static async findPurchaseOrderLineById(id: string) {
      return await prisma.purchaseOrderLine.findUnique({ where: { id } });
  }

  static async updatePurchaseOrder(id: string, data: any, tx: any = prisma) {
      return await tx.purchaseOrder.update({
          where: { id },
          data
      });
  }
}
