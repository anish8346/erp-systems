import prisma from '../../../core/database/prisma.js';
import { logActivity } from '../../../core/utils/logger.js';
import { ProcurementRepository } from '../repositories/procurement.repository.js';
import { AutomationService } from '../../../core/utils/automation.js';

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

interface ReceiveItemInput {
  lineId: string;
  quantity: number | string;
}

export class ProcurementService {
  static async createPurchaseOrder(data: CreatePurchaseOrderInput, userId?: string) {
    const { vendorId, orderLines } = data;
    if (!vendorId || !orderLines?.length) {
      throw new Error('Vendor and products are required for procurement.');
    }

    const po = await ProcurementRepository.createPurchaseOrder(data);

    if (userId) {
      await logActivity(userId, 'CREATE', 'PURCHASE_ORDER', po.id, `Created procurement order ${po.id} in DRAFT status`);
    }

    return po;
  }

  static async confirmPurchaseOrder(id: string, userId?: string) {
    const po = await ProcurementRepository.findPurchaseOrderById(id);
    if (!po) throw new Error('Purchase Order not found.');
    if (po.status !== 'DRAFT' && po.status !== 'NEGOTIATION') throw new Error('Only DRAFT or NEGOTIATION orders can be confirmed.');

    await ProcurementRepository.updatePurchaseOrder(id, { status: 'CONFIRMED' });

    if (userId) {
      await logActivity(userId, 'CONFIRM', 'PURCHASE_ORDER', id, `Confirmed procurement order ${id}`);
    }

    return ProcurementRepository.findPurchaseOrderById(id);
  }

  static async startNegotiation(id: string, userId?: string) {
    const po = await ProcurementRepository.findPurchaseOrderById(id);
    if (!po) throw new Error('Purchase Order not found.');
    if (po.status !== 'DRAFT') throw new Error('Only DRAFT orders can be moved to negotiation.');

    await ProcurementRepository.updatePurchaseOrder(id, { status: 'NEGOTIATION' });

    if (userId) {
      await logActivity(userId, 'START_NEGOTIATION', 'PURCHASE_ORDER', id, `Started negotiation for procurement order ${id}`);
    }

    return ProcurementRepository.findPurchaseOrderById(id);
  }

  static async addNegotiationComment(id: string, text: string, userId: string) {
    const po = await ProcurementRepository.findPurchaseOrderById(id);
    if (!po) throw new Error('Purchase Order not found.');

    await ProcurementRepository.addComment({ purchaseOrderId: id, userId, text });

    await logActivity(userId, 'COMMENT', 'PURCHASE_ORDER', id, `Added negotiation comment: ${text.substring(0, 50)}...`);

    return ProcurementRepository.findPurchaseOrderById(id);
  }

  static async updateNegotiatedPrice(id: string, lineId: string, newPrice: number, userId: string) {
    const po = await ProcurementRepository.findPurchaseOrderById(id);
    if (!po) throw new Error('Purchase Order not found.');
    if (po.status !== 'NEGOTIATION' && po.status !== 'DRAFT') throw new Error('Can only update price in DRAFT or NEGOTIATION status.');

    return await prisma.$transaction(async (tx) => {
      const line = await tx.purchaseOrderLine.findUnique({ where: { id: lineId } });
      if (!line || line.purchaseOrderId !== id) throw new Error('Order line not found.');

      await tx.purchaseOrderLine.update({
        where: { id: lineId },
        data: { price: newPrice }
      });

      // Recalculate total amount from all lines
      const allLines = await tx.purchaseOrderLine.findMany({
        where: { purchaseOrderId: id }
      });
      
      const totalAmount = allLines.reduce((acc, l) => acc + (l.quantity * l.price), 0);

      await tx.purchaseOrder.update({
        where: { id },
        data: { totalAmount }
      });

      // AUTOMATION: Update product cost price
      await tx.product.update({
        where: { id: line.productId },
        data: { costPrice: newPrice }
      });

      return await tx.purchaseOrder.findUnique({
        where: { id },
        include: { 
          orderLines: { include: { product: true } }, 
          vendor: true, 
          responsiblePerson: true,
          comments: { include: { user: true }, orderBy: { createdAt: 'asc' } }
        }
      });
    });

    // Recalculate BoMs after transaction success
    const lineObj = po?.orderLines.find(l => l.id === lineId);
    if (lineObj) {
        await AutomationService.recalculateBoMCosts(lineObj.productId);
    }

    await logActivity(userId, 'UPDATE_PRICE', 'PURCHASE_ORDER', id, `Updated negotiated price for a line item to ₹${newPrice}`);
    
    return ProcurementRepository.findPurchaseOrderById(id);
  }

  static async cancelPurchaseOrder(id: string, userId?: string) {
    const po = await ProcurementRepository.findPurchaseOrderById(id);
    if (!po) throw new Error('Purchase Order not found.');
    
    const updatedPo = await ProcurementRepository.updatePurchaseOrder(id, { status: 'CANCELLED' });

    if (userId) {
      await logActivity(userId, 'CANCEL', 'PURCHASE_ORDER', id, `Cancelled procurement order ${id}`);
    }

    return updatedPo;
  }

  static async receivePurchaseOrder(id: string, items: ReceiveItemInput[], userId?: string) {
    const po = await ProcurementRepository.findPurchaseOrderById(id);

    if (!po) throw new Error('Purchase Order not found.');
    if (po.status === 'FULLY_RECEIVED') throw new Error('Order already fully received.');
    if (po.status === 'CANCELLED') throw new Error('Cannot receive a cancelled order.');
    if (po.status === 'DRAFT') throw new Error('Order must be confirmed before receiving.');

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

      const updatedPoData = await tx.purchaseOrder.findUnique({
        where: { id },
        include: { orderLines: true }
      });

      const totalAmount = updatedPoData?.orderLines.reduce((acc, l) => acc + (l.receivedQty * l.price), 0) || 0;

      await tx.purchaseOrder.update({
        where: { id },
        data: { 
          status: allReceived ? 'FULLY_RECEIVED' : 'PARTIALLY_RECEIVED',
          totalAmount
        },
      });

      // AUTOMATION: Update product cost price on receipt
      for (const line of po.orderLines) {
        const itemReceived = items?.find((i: ReceiveItemInput) => i.lineId === line.id);
        if (itemReceived && Number(itemReceived.quantity) > 0) {
          await tx.product.update({
            where: { id: line.productId },
            data: { costPrice: line.price }
          });
        }
      }
    });

    // Recalculate BoMs and check replenishment after transaction
    for (const line of po.orderLines) {
      await AutomationService.recalculateBoMCosts(line.productId);
      await AutomationService.triggerSmartReplenishment(line.productId, userId);
    }

    if (userId) {
        await logActivity(userId, 'RECEIVE', 'PURCHASE_ORDER', id, `Processed receipt for procurement order ${id}`);
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
