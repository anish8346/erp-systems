import type { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { logActivity } from '../utils/logger.js';

export const createMO = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, bomId } = req.body;
    if (!productId || !bomId) {
      return res.status(400).json({ error: 'Product and BoM are required to plan production.' });
    }
    
    const bom = await prisma.boM.findUnique({
      where: { id: bomId },
      include: { operations: true }
    });

    const mo = await prisma.manufacturingOrder.create({
      data: {
        productId,
        quantity: Number(quantity),
        bomId,
        status: 'DRAFT',
        WorkOrders: {
          create: (bom?.operations || []).map(op => ({
            operationId: op.id,
            status: 'PENDING',
            duration: op.duration * Number(quantity),
          }))
        }
      },
    });

    if (req.user) {
      await logActivity(req.user.id, 'CREATE', 'MO', mo.id, `Planned production for ${quantity} units with ${bom?.operations.length || 0} work steps`);
    }

    res.status(201).json(mo);
  } catch (error: any) {
    console.error('[CreateMO Error]:', error);
    res.status(500).json({ error: 'Failed to create manufacturing order.' });
  }
};

export const produceMO = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const mo = await prisma.manufacturingOrder.findUnique({
      where: { id },
      include: { 
        bom: { include: { bomLines: { include: { component: true } } } },
        product: true,
        WorkOrders: true
      },
    });

    if (!mo) return res.status(404).json({ error: 'MO not found.' });
    if (mo.status === 'DONE') return res.status(400).json({ error: 'Production already marked as complete.' });

    const allWorkOrdersDone = mo.WorkOrders.every(wo => wo.status === 'DONE');
    if (mo.WorkOrders.length > 0 && !allWorkOrdersDone) {
      return res.status(400).json({ error: 'Cannot finalize: Some work steps are still in progress.' });
    }

    await prisma.$transaction(async (tx) => {
      for (const line of mo.bom.bomLines) {
        const requiredQty = line.quantity * mo.quantity;
        
        const component = await tx.product.findUnique({
          where: { id: line.componentId }
        });

        if (!component || component.qtyOnHand < requiredQty) {
          throw new Error(`Insufficient stock for component: ${component?.name || 'Unknown'}. Needed: ${requiredQty}, have: ${component?.qtyOnHand || 0}`);
        }

        await tx.product.update({
          where: { id: line.componentId },
          data: { qtyOnHand: { decrement: requiredQty } },
        });

        await tx.stockLedger.create({
          data: {
            productId: line.componentId,
            quantityChange: -requiredQty,
            type: 'MFG_CONSUME',
            referenceId: mo.id,
          },
        });
      }

      await tx.product.update({
        where: { id: mo.productId },
        data: { 
            qtyOnHand: { increment: mo.quantity },
            qtyReserved: { decrement: mo.quantity > mo.product.qtyReserved ? mo.product.qtyReserved : mo.quantity }
        },
      });

      await tx.stockLedger.create({
        data: {
          productId: mo.productId,
          quantityChange: mo.quantity,
          type: 'MFG_PRODUCE',
          referenceId: mo.id,
        },
      });

      await tx.manufacturingOrder.update({
        where: { id },
        data: { status: 'DONE' },
      });
    });

    if (req.user) {
      await logActivity(req.user.id, 'PRODUCE', 'MO', id, `Completed production of ${mo.quantity} ${mo.product.name}`);
    }

    res.json({ message: 'Production completed successfully.' });
  } catch (error: any) {
    console.error('[ProduceMO Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to finalize production.' });
  }
};

export const updateWorkOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const wo = await prisma.workOrder.update({
      where: { id },
      data: { status },
      include: { mo: { include: { product: true } }, operation: true }
    });

    if (req.user) {
      await logActivity(req.user.id, 'UPDATE_STATUS', 'WORK_ORDER', id, `Updated ${wo.operation.name} for ${wo.mo.product.name} to ${status}`);
    }

    res.json(wo);
  } catch (error: any) {
    console.error('[UpdateWOStatus Error]:', error);
    res.status(500).json({ error: 'Failed to update work step status.' });
  }
};

export const getMOs = async (req: Request, res: Response) => {
    try {
      const mos = await prisma.manufacturingOrder.findMany({
        include: { product: true, bom: true, WorkOrders: { include: { operation: { include: { workCenter: true } } } } },
        orderBy: { createdAt: 'desc' }
      });
      res.json(mos);
    } catch (error: any) {
      console.error('[GetMOs Error]:', error);
      res.status(500).json({ error: 'Failed to retrieve manufacturing orders.' });
    }
};
