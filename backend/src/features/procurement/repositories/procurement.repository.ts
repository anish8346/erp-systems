import { Prisma } from '@prisma/client';
import prisma from '../../../core/database/prisma.js';

interface PurchaseOrderLineInput {
  productId: string;
  quantity: number | string;
  price: number | string;
}

interface CreatePurchaseOrderInput {
  vendorId: string;
  vendorName: string;
  vendorAddress?: string;
  responsiblePersonId?: string;
  orderLines: PurchaseOrderLineInput[];
}

export class ProcurementRepository {
  static async createPurchaseOrder(data: CreatePurchaseOrderInput) {
    const { vendorId, vendorName, vendorAddress, responsiblePersonId, orderLines } = data;
    const totalAmount = orderLines.reduce((acc: number, line: PurchaseOrderLineInput) => acc + (Number(line.quantity) * Number(line.price)), 0);
    
    return await prisma.purchaseOrder.create({
      data: {
        vendorId,
        vendorName,
        vendorAddress,
        responsiblePersonId,
        status: 'DRAFT',
        totalAmount,
        orderLines: {
          create: orderLines.map((line: PurchaseOrderLineInput) => ({
            productId: line.productId,
            quantity: Number(line.quantity),
            price: Number(line.price),
            initialPrice: Number(line.price),
          })),
        },
      },
      include: { orderLines: true, vendor: true, responsiblePerson: true },
    });
  }

  static async findPurchaseOrderById(id: string) {
    return await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { 
        orderLines: { include: { product: true } }, 
        vendor: true, 
        responsiblePerson: true,
        comments: { include: { user: true }, orderBy: { createdAt: 'asc' } }
      },
    });
  }

  static async getPurchaseOrders() {
    return await prisma.purchaseOrder.findMany({
      include: { 
        orderLines: { include: { product: true } },
        vendor: true,
        responsiblePerson: true,
        comments: { include: { user: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async addComment(data: { purchaseOrderId: string, userId: string, text: string }) {
    return await prisma.purchaseOrderComment.create({
      data,
      include: { user: true }
    });
  }

  static async updatePurchaseOrderLine(id: string, data: { price?: number, quantity?: number }) {
    return await prisma.purchaseOrderLine.update({
      where: { id },
      data
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

  static async updatePurchaseOrder(id: string, data: Prisma.PurchaseOrderUpdateInput, tx: Prisma.TransactionClient = prisma) {
      return await tx.purchaseOrder.update({
          where: { id },
          data
      });
  }
}
