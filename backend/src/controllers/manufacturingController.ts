import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import { logActivity } from '../utils/logger';

export const createMO = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, bomId } = req.body;
    const mo = await prisma.manufacturingOrder.create({
      data: {
        productId,
        quantity,
        bomId,
        status: 'DRAFT',
      },
    });

    if (req.user) {
      await logActivity(req.user.id, 'CREATE', 'MO', mo.id, `Planned production for ${quantity} units`);
    }

    res.status(201).json(mo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const produceMO = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const mo = await prisma.manufacturingOrder.findUnique({
      where: { id },
      include: { 
        bom: { include: { bomLines: true } },
        product: true
      },
    });

    if (!mo) return res.status(404).json({ error: 'MO not found' });
    if (mo.status === 'DONE') return res.status(400).json({ error: 'MO already completed' });

    // Transaction: Consume components and produce finished good
    await prisma.$transaction(async (tx) => {
      // 1. Validate and Consume components
      for (const line of mo.bom.bomLines) {
        const requiredQty = line.quantity * mo.quantity;
        
        // Fetch current stock for validation
        const component = await tx.product.findUnique({
          where: { id: line.componentId }
        });

        if (!component || component.qtyOnHand < requiredQty) {
          throw new Error(`Insufficient stock for component: ${component?.name || 'Unknown'}. Required: ${requiredQty}, Available: ${component?.qtyOnHand || 0}`);
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

      // 2. Produce Finished Good
      await tx.product.update({
        where: { id: mo.productId },
        data: { 
            qtyOnHand: { increment: mo.quantity },
            // If it was reserved (MTO), reduce reservation
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

    res.json({ message: 'Production completed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMOs = async (req: Request, res: Response) => {
    try {
      const mos = await prisma.manufacturingOrder.findMany({
        include: { product: true, bom: true },
      });
      res.json(mos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
};
