import prisma from '../../../core/database/prisma.js';
import { logActivity } from '../../../core/utils/logger.js';
import { ProcurementRepository } from '../repositories/procurement.repository.js';

interface PurchaseOrderLineInput {
  productId: string;
  quantity: number | string;
  price: number | string;
}

interface CreatePurchaseOrderInput {
  vendorId?: string;
  vendorName: string;
  orderLines: PurchaseOrderLineInput[];
}

interface ReceiveItemInput {
  lineId: string;
  quantity: number | string;
}

export class ProcurementService {
  static async createPurchaseOrder(data: CreatePurchaseOrderInput, userId?: string) {
    const { vendorName, orderLines } = data;
    if (!vendorName || !orderLines?.length) {
      throw new Error('Vendor and products are required for procurement.');
    }

    const po = await ProcurementRepository.createPurchaseOrder(data);

    if (userId) {
      await logActivity(userId, 'CREATE', 'PURCHASE_ORDER', po.id, `Created procurement order for vendor ${vendorName}`);
    }

    return po;
  }

  static async receivePurchaseOrder(id: string, items: ReceiveItemInput[], userId?: string) {
    const po = await ProcurementRepository.findPurchaseOrderById(id);

    if (!po) throw new Error('Purchase Order not found.');
    if (po.status === 'RECEIVED') throw new Error('Order already fully received.');

    await prisma.$transaction(async (tx) => {
      let allReceived = true;

      for (const line of po.orderLines) {
        const itemToReceive = items?.find((i: ReceiveItemInput) => i.lineId === line.id);
        const qtyToReceive = itemToReceive ? Number(itemToReceive.quantity) : 0;

        if (qtyToReceive > 0) {
          const remainingToReceive = line.quantity - line.receivedQty;
          if (qtyToReceive > remainingToReceive) {
            throw new Error(`Cannot receive ${qtyToReceive} for ${line.productId}. Only ${remainingToReceive} remaining.`);
          }

          await tx.product.update({
            where: { id: line.productId },
            data: { qtyOnHand: { increment: qtyToReceive } },
          });

          await tx.purchaseOrderLine.update({
            where: { id: line.id },
            data: { receivedQty: { increment: qtyToReceive } }
          });

          await tx.stockLedger.create({
            data: {
              productId: line.productId,
              quantityChange: qtyToReceive,
              type: 'PURCHASE',
              referenceId: po.id,
            },
          });
        }

        const updatedLine = await tx.purchaseOrderLine.findUnique({ where: { id: line.id } });
        if (updatedLine && updatedLine.receivedQty < updatedLine.quantity) {
          allReceived = false;
        }
      }

      await tx.purchaseOrder.update({
        where: { id },
        data: { status: allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED' },
      });
    });

    if (userId) {
        await logActivity(userId, 'RECEIVE', 'PURCHASE_ORDER', id, `Processed receipt for procurement order from ${po.vendorName}`);
    }
  }

  static async getPurchaseOrders() {
    return await ProcurementRepository.getPurchaseOrders();
  }

  static async createVendor(data: { name: string, email?: string, phone?: string, address?: string }, userId?: string) {
    const vendor = await ProcurementRepository.createVendor(data);

    if (userId) {
      await logActivity(userId, 'CREATE', 'VENDOR', vendor.id, `Created vendor: ${data.name}`);
    }

    return vendor;
  }

  static async getVendors() {
    return await ProcurementRepository.getVendors();
  }

  static async updateVendor(id: string, data: { name?: string, email?: string, phone?: string, address?: string }, userId?: string) {
    const vendor = await ProcurementRepository.updateVendor(id, data);

    if (userId) {
      await logActivity(userId, 'UPDATE', 'VENDOR', id, `Updated vendor: ${vendor.name}`);
    }

    return vendor;
  }
}
