
import { Prisma } from '@prisma/client';
import prisma from '../database/prisma.js';

/**
 * Validates if enough physical stock exists for a list of items.
 * Throws an error with a descriptive message if stock is insufficient.
 */
export const validateStockAvailability = async (tx: Prisma.TransactionClient, items: { productId: string, quantity: number }[]) => {
  for (const item of items) {
    const product = await tx.product.findUnique({
      where: { id: item.productId },
      select: { name: true, qtyOnHand: true }
    });

    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found.`);
    }

    if (product.qtyOnHand < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.qtyOnHand}, Requested: ${item.quantity}`);
    }
  }
};
