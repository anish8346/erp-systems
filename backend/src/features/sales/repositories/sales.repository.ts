import prisma from '../../../core/database/prisma.js';

export class SalesRepository {
  async createSalesOrder(data: any) {
    const { customerName, orderLines, totalAmount } = data;
    return await prisma.salesOrder.create({
      data: {
        customerName,
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

  async findSalesOrderById(id: string) {
    return await prisma.salesOrder.findUnique({
      where: { id },
      include: { orderLines: { include: { product: true } } },
    });
  }

  async updateProductReservedQty(productId: string, quantity: number) {
    return await prisma.product.update({
      where: { id: productId },
      data: { qtyReserved: { increment: quantity } }
    });
  }

  async createManufacturingOrder(data: any) {
    return await prisma.manufacturingOrder.create({
      data
    });
  }

  async createPurchaseOrder(data: any) {
    return await prisma.purchaseOrder.create({
      data
    });
  }

  async updateSalesOrderStatus(id: string, status: any) {
    return await prisma.salesOrder.update({
      where: { id },
      data: { status },
    });
  }

  async findAllSalesOrders() {
    return await prisma.salesOrder.findMany({
      include: { orderLines: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deliverOrderTransaction(so: any, items: any[]) {
    return await prisma.$transaction(async (tx) => {
      let allDelivered = true;

      for (const line of so.orderLines) {
        const itemToDeliver = items?.find((i: any) => i.lineId === line.id);
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
