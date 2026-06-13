import prisma from '../../../core/database/prisma.js';
import { logActivity } from '../../../core/utils/logger.js';
import { OperationsRepository } from '../repositories/operations.repository.js';
import type { MOStatus, WOStatus } from '../../../core/types/index.js';

export class OperationsService {
  static async createMO(data: any, userId?: string) {
    const bom = await OperationsRepository.findBoMById(data.bomId);
    if (!bom) throw new Error('Bill of Materials not found.');

    const moData = {
      ...data,
      components: bom.bomLines.map(line => ({
        productId: line.componentId,
        toConsume: Number(line.quantity) * Number(data.quantity)
      })),
      workOrders: bom.operations?.map(op => ({
        operationId: op.id,
        workCenterId: op.workCenterId,
        expectedDuration: Number(op.duration) * Number(data.quantity)
      })) || []
    };

    const mo = await OperationsRepository.createMO(moData);

    if (userId) {
      await logActivity(userId, 'CREATE', 'MANUFACTURING_ORDER', mo.id, `Created MO for ${mo.product.name} (Qty: ${mo.quantity})`);
    }

    return mo;
  }

  static async confirmMO(id: string, userId?: string) {
    const mo = await OperationsRepository.findMOById(id);
    if (!mo) throw new Error('MO not found.');
    if (mo.status !== 'DRAFT') throw new Error('Only DRAFT MOs can be confirmed.');

    await prisma.$transaction(async (tx) => {
      // Reserve components
      for (const comp of (mo.components || [])) {
        await tx.product.update({
          where: { id: comp.productId },
          data: { qtyReserved: { increment: comp.toConsume } }
        });
      }

      await tx.manufacturingOrder.update({
        where: { id },
        data: { status: 'CONFIRMED' }
      });
    });

    if (userId) {
      const updatedMo = await OperationsRepository.findMOById(id);
      await logActivity(userId, 'CONFIRM', 'MANUFACTURING_ORDER', id, `Confirmed MO for ${updatedMo?.product.name}`);
    }

    return await OperationsRepository.findMOById(id);
  }

  static async produceMO(id: string, userId?: string) {
    const mo = await OperationsRepository.findMOById(id);
    if (!mo) throw new Error('MO not found.');
    if (mo.status === 'DONE' || mo.status === 'CANCELLED') throw new Error('MO already completed or cancelled.');

    await prisma.$transaction(async (tx) => {
      // 1. Consume components
      for (const comp of (mo.components || [])) {
        const consumedQty = comp.consumed || comp.toConsume; // Use entered consumed or fallback to planned
        await tx.product.update({
          where: { id: comp.productId },
          data: { 
            qtyOnHand: { decrement: consumedQty },
            qtyReserved: { decrement: comp.toConsume } // Use planned toConsume for reservation release
          }
        });

        await tx.stockLedger.create({
          data: {
            productId: comp.productId,
            quantityChange: -consumedQty,
            type: 'MFG_CONSUME',
            referenceId: mo.id
          }
        });
      }

      // 2. Add finished good
      await tx.product.update({
        where: { id: mo.productId },
        data: { qtyOnHand: { increment: mo.quantity } }
      });

      await tx.stockLedger.create({
        data: {
          productId: mo.productId,
          quantityChange: mo.quantity,
          type: 'MFG_PRODUCE',
          referenceId: mo.id
        }
      });

      // 3. Mark MO as DONE
      await tx.manufacturingOrder.update({
        where: { id },
        data: { status: 'DONE' }
      });

      // 4. Mark all Work Orders as DONE if not already
      await tx.workOrder.updateMany({
        where: { moId: id },
        data: { status: 'DONE' }
      });
    });

    if (userId) {
      await logActivity(userId, 'PRODUCE', 'MANUFACTURING_ORDER', id, `Produced ${mo.quantity} units of ${mo.product.name}`);
    }

    return { message: 'Production completed successfully.' };
  }

  static async cancelMO(id: string, userId?: string) {
    const mo = await OperationsRepository.findMOById(id);
    if (!mo) throw new Error('MO not found.');
    if (mo.status === 'DONE') throw new Error('Cannot cancel a completed MO.');

    const updated = await OperationsRepository.updateMOStatus(id, 'CANCELLED');

    if (userId) {
      await logActivity(userId, 'CANCEL', 'MANUFACTURING_ORDER', id, `Cancelled MO for ${mo.product?.name}`);
    }

    return updated;
  }

  static async updateWorkOrderStatus(id: string, status: WOStatus, userId?: string) {
    const wo = await OperationsRepository.updateWorkOrder(id, { status });

    if (userId) {
      await logActivity(userId, 'UPDATE_STATUS', 'WORK_ORDER', id, `Updated ${wo.operation?.name || wo.operationName} to ${status}`);
    }

    return wo;
  }

  static async updateWorkOrderDuration(id: string, realDuration: number, userId?: string) {
    const wo = await OperationsRepository.updateWorkOrder(id, { realDuration });

    if (userId) {
      await logActivity(userId, 'UPDATE_DURATION', 'WORK_ORDER', id, `Updated real duration to ${realDuration} mins`);
    }

    return wo;
  }

  static async updateComponentConsumed(id: string, consumed: number, userId?: string) {
    const comp = await OperationsRepository.updateComponentConsumption(id, consumed);

    if (userId) {
      await logActivity(userId, 'UPDATE_CONSUMPTION', 'MO_COMPONENT', id, `Updated consumed quantity to ${consumed}`);
    }

    return comp;
  }

  static async getMOs() {
    return await OperationsRepository.getMOs();
  }
}
