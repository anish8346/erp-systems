import prisma from '../../../core/database/prisma.js';
import type { CreateSalesOrderData, CreateSalesOrderLine, DeliverItem, SalesOrderStatus, CreateMOData, CreatePOData, SalesOrder, SalesOrderLine } from '../../../core/types/index.js';

export class SalesRepository {
  async createSalesOrder(data: CreateSalesOrderData & { totalAmount: number; customerId?: string; taxRate?: number; taxAmount?: number }) {
    const { customerName, customerAddress, salesPersonId, orderLines, totalAmount, customerId, taxRate, taxAmount } = data;
    return await prisma.salesOrder.create({
      data: {
        customerName,
        customerAddress,
        customerId,
        salesPersonId,
        status: 'DRAFT',
        totalAmount,
        taxRate: taxRate || 0,
        taxAmount: taxAmount || 0,
        orderLines: {
          create: orderLines.map((line: CreateSalesOrderLine) => ({
            productId: line.productId,
            quantity: Number(line.quantity),
            price: Number(line.price),
            initialPrice: Number(line.price),
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
        salesPerson: true,
        comments: { include: { user: true }, orderBy: { createdAt: 'asc' } }
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
      data: {
        productId: data.productId,
        quantity: Number(data.quantity),
        status: data.status || 'DRAFT',
        bomId: data.bomId,
        assigneeId: data.assigneeId && data.assigneeId.trim() !== '' ? data.assigneeId : undefined,
        components: {
          create: (data.components || []).map(c => ({
            productId: c.productId,
            toConsume: Number(c.toConsume),
            consumed: 0,
          }))
        },
        WorkOrders: {
          create: (data.workOrders || []).map(w => ({
            operationId: w.operationId,
            operationName: w.operationName,
            workCenterId: w.workCenterId,
            expectedDuration: Number(w.expectedDuration),
            realDuration: 0,
            status: 'PENDING',
          }))
        }
      },
      include: {
        product: true,
        bom: true,
        components: { include: { product: true } },
        WorkOrders: { include: { operation: true, workCenter: true } },
      }
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
      for (const line of (so.orderLines || [])) {
        if (line.deliveredQty >= line.quantity) continue;

        const product = await tx.product.findUnique({ where: { id: line.productId } });
        if (!product) continue;

        const releasedQty = Math.min(line.quantity - line.deliveredQty, Number(product.qtyReserved));
        if (releasedQty > 0) {
          await tx.product.update({
            where: { id: line.productId },
            data: { qtyReserved: { decrement: releasedQty } }
          });
        }
      }

      const productIds = so.orderLines.map(l => l.productId);

      const linkedMOs = await tx.manufacturingOrder.findMany({
        where: {
          status: { in: ['DRAFT', 'CONFIRMED'] },
          components: { some: { productId: { in: productIds } } }
        },
        select: { id: true }
      });

      const linkedPO = await tx.purchaseOrder.findFirst({
        where: {
          status: 'DRAFT',
          orderLines: { some: { productId: { in: productIds } } }
        },
        select: { id: true }
      });

      if (linkedMOs.length > 0) {
        await tx.manufacturingOrder.updateMany({
          where: { id: { in: linkedMOs.map(m => m.id) } },
          data: { status: 'CANCELLED' }
        });

        for (const moId of linkedMOs.map(m => m.id)) {
          const moComponents = (await tx.manufacturingOrder.findUnique({
            where: { id: moId },
            include: { components: { include: { product: true } } }
          }))?.components || [];

          for (const comp of moComponents) {
            if (!comp.product) continue;
            const released = Math.min(comp.toConsume, Number(comp.product.qtyReserved));
            if (released > 0) {
              await tx.product.update({
                where: { id: comp.productId },
                data: { qtyReserved: { decrement: released } }
              });
            }
          }
        }
      }

      if (linkedPO) {
        await tx.purchaseOrder.update({
          where: { id: linkedPO.id },
          data: { status: 'CANCELLED' }
        });
      }

      return await tx.salesOrder.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    });
  }

  async findAllSalesOrders(filters: { 
    page: number; 
    limit: number; 
    searchTerm?: string; 
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page, limit, searchTerm, status, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (searchTerm) {
      where.OR = [
        { customerName: { contains: searchTerm, mode: 'insensitive' } },
        { id: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if ((startDate && startDate.trim() !== '') || (endDate && endDate.trim() !== '')) {
      where.createdAt = {};
      if (startDate && startDate.trim() !== '') {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          where.createdAt.gte = start;
        }
      }
      if (endDate && endDate.trim() !== '') {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          where.createdAt.lte = end;
        }
      }
      // If after validation nothing was added, remove createdAt from where
      if (Object.keys(where.createdAt).length === 0) delete where.createdAt;
    }

    const [orders, totalItems] = await Promise.all([
      prisma.salesOrder.findMany({
        where,
        include: { 
          orderLines: { include: { product: true } },
          salesPerson: true,
          comments: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.salesOrder.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    };
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

  async addComment(data: { salesOrderId: string, userId: string, text: string }) {
    return await prisma.salesOrderComment.create({
      data,
      include: { user: true }
    });
  }

  async updateSalesOrderLine(id: string, data: { price?: number, quantity?: number }) {
    return await prisma.salesOrderLine.update({
      where: { id },
      data
    });
  }

  async updateSalesOrder(id: string, data: { status?: SalesOrderStatus, totalAmount?: number, taxRate?: number, taxAmount?: number }) {
    return await prisma.salesOrder.update({
      where: { id },
      data
    });
  }
}

export const salesRepository = new SalesRepository();
