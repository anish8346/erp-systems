import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { vendorName, orderLines } = req.body;
    const totalAmount = orderLines.reduce((acc: number, line: any) => acc + (line.quantity * line.price), 0);
    
    const po = await prisma.purchaseOrder.create({
      data: {
        vendorName,
        status: 'DRAFT',
        totalAmount,
        orderLines: {
          create: orderLines.map((line: any) => ({
            productId: line.productId,
            quantity: line.quantity,
            price: line.price,
          })),
        },
      },
      include: { orderLines: true },
    });
    res.status(201).json(po);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const receivePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { orderLines: true },
    });

    if (!po) return res.status(404).json({ error: 'Purchase Order not found' });
    if (po.status === 'RECEIVED') return res.status(400).json({ error: 'Order already received' });

    // Transaction to update stock and ledger
    await prisma.$transaction(async (tx) => {
      for (const line of po.orderLines) {
        await tx.product.update({
          where: { id: line.productId },
          data: { qtyOnHand: { increment: line.quantity } },
        });

        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            quantityChange: line.quantity,
            type: 'PURCHASE',
            referenceId: po.id,
          },
        });
      }

      await tx.purchaseOrder.update({
        where: { id },
        data: { status: 'RECEIVED' },
      });
    });

    res.json({ message: 'Products received successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPurchaseOrders = async (req: Request, res: Response) => {
    try {
      const orders = await prisma.purchaseOrder.findMany({
        include: { orderLines: { include: { product: true } } },
      });
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
};
