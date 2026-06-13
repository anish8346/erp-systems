import prisma from '../../../core/database/prisma.js';
import type { CreateSalesOrderData, CreateSalesOrderLine, DeliverItem, SalesOrderStatus, CreateMOData, CreatePOData, SalesOrder, SalesOrderLine } from '../../../core/types/index.js';

export class SalesRepository {
  async createSalesOrder(data: CreateSalesOrderData & { totalAmount: number }) {
    const { customerName, customerAddress, salesPersonId, orderLines, totalAmount } = data;
    return await prisma.salesOrder.create({
      data: {
        customerName,
        customerAddress,
        salesPersonId,
        status: 'DRAFT',
        totalAmount,
        orderLines: {
          create: orderLines.map((line: CreateSalesOrderLine) => ({
            productId: line.productId,
            quantity: Number(line.quantity),
            price: Number(line.price),
          })),
        },
      },
      include: { orderLines: true },
    });
  }

  async findSalesOrderById(id: string) {
    return await prisma.salesOrder.findUnique({
      where: { id },
      include: { 
        orderLines: { include: { product: true } },
        salesPerson: true
      },
    });
  }

  async updateProductReservedQty(productId: string, quantity: number) {
    return await prisma.product.update({
      where: { id: productId },
      data: { qtyReserved: { increment: quantity } }
    });
  }

  async createManufacturingOrder(data: CreateMOData) {
    return await prisma.manufacturingOrder.create({
      data
    });
  }

  async createPurchaseOrder(data: CreatePOData) {
    return await prisma.purchaseOrder.create({
      data
    });
  }

  async updateSalesOrderStatus(id: string, status: SalesOrderStatus) {
    return await prisma.salesOrder.update({
      where: { id },
      data: { status },
    });
  }

  async cancelSalesOrder(id: string) {
    const so = await this.findSalesOrderById(id);
    if (!so) throw new Error('Sales Order not found.');

    return await prisma.$transaction(async (tx) => {
      // Release reservations
      for (const line of (so.orderLines || [])) {
        const remainingToDeliver = line.quantity - line.deliveredQty;
        if (remainingToDeliver > 0) {
          await tx.product.update({
            where: { id: line.productId },
            data: { qtyReserved: { decrement: remainingToDeliver } }
          });
        }
      }

      return await tx.salesOrder.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    });
  }

  async findAllSalesOrders() {
    return await prisma.salesOrder.findMany({
      include: { 
        orderLines: { include: { product: true } },
        salesPerson: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deliverOrderTransaction(so: SalesOrder & { orderLines: SalesOrderLine[] }, items: DeliverItem[]) {
    return await prisma.$transaction(async (tx) => {
      let allDelivered = true;

      for (const line of so.orderLines) {
        const itemToDeliver = items?.find((i: DeliverItem) => i.lineId === line.id);
        const qtyToDeliver = itemToDeliver ? Number(itemToDeliver.quantity) : 0;
        if (qtyToDeliver > 0) {
          const remainingToDeliver = line.quantity - line.deliveredQty;
          if (qtyToDeliver > remainingToDeliver) {
            throw new Error(`Cannot deliver ${qtyToDeliver} for ${line.productId}. Only ${remainingToDeliver} remaining.`);
          }

          const product = await tx.product.findUnique({ where: { id: line.productId } });
          if (!product || product.qtyOnHand < qtyToDeliver) {
            throw new Error(`Insufficient physical stock for ${product?.name || 'product'}. Required: ${qtyToDeliver}, Available: ${product?.qtyOnHand || 0}`);
          }

          await tx.product.update({
            where: { id: line.productId },
            data: { 
              qtyOnHand: { decrement: qtyToDeliver },
              qtyReserved: { decrement: qtyToDeliver }
            }
          });

          await tx.salesOrderLine.update({
            where: { id: line.id },
            data: { deliveredQty: { increment: qtyToDeliver } }
          });

          await tx.stockLedger.create({
            data: {
              productId: line.productId,
              quantityChange: -qtyToDeliver,
              type: 'SALE',
              referenceId: so.id,
            },
          });
        }

        const updatedLine = await tx.salesOrderLine.findUnique({ where: { id: line.id } });
        if (updatedLine && updatedLine.deliveredQty < updatedLine.quantity) {
          allDelivered = false;
        }
      }

      await tx.salesOrder.update({
        where: { id: so.id },
        data: { status: allDelivered ? 'DELIVERED' : 'PARTIALLY_DELIVERED' },
      });
    });
  }
}

export const salesRepository = new SalesRepository();
