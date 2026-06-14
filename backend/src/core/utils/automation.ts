import prisma from '../database/prisma.js';
import { logActivity } from '../utils/logger.js';

export class AutomationService {
  /**
   * Recalculates the cost of all finished goods that use this product as a component.
   * Useful when raw material prices change.
   */
  static async recalculateBoMCosts(productId: string) {
    // 1. Find all BoMs where this product is used as a component
    const affectedBoMLines = await prisma.boMLine.findMany({
      where: { componentId: productId },
      include: { bom: true }
    });

    for (const line of affectedBoMLines) {
      const bomId = line.bomId;
      
      // 2. Calculate total cost for this BoM
      const allLines = await prisma.boMLine.findMany({
        where: { bomId },
        include: { component: true }
      });

      const materialCost = allLines.reduce((acc, l) => {
        return acc + (l.quantity * l.component.costPrice);
      }, 0);

      // We could also add operation costs here if needed
      const totalCost = materialCost;

      // 3. Update the parent product's costPrice
      const parentBoM = await prisma.boM.findUnique({
        where: { id: bomId },
        select: { productId: true }
      });

      if (parentBoM) {
        await prisma.product.update({
          where: { id: parentBoM.productId },
          data: { costPrice: totalCost }
        });

        // 4. Recursively trigger recalculation for the parent (in case it's a sub-assembly)
        await this.recalculateBoMCosts(parentBoM.productId);
      }
    }
  }

  /**
   * Checks if a product's stock has fallen below its minimum threshold.
   * If so, creates a draft Purchase Order for the assigned vendor.
   */
  static async triggerSmartReplenishment(productId: string, userId?: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { vendor: true }
    });

    if (!product || !product.vendorId || product.minStock <= 0) return;

    const availability = product.qtyOnHand - product.qtyReserved;

    if (availability < product.minStock) {
      // 1. Check if there's already an active (Draft/Negotiation) PO for this product from the same vendor
      const existingPO = await prisma.purchaseOrder.findFirst({
        where: {
          vendorId: product.vendorId,
          status: { in: ['DRAFT', 'NEGOTIATION'] },
          orderLines: {
            some: { productId: product.id }
          }
        }
      });

      if (existingPO) return; // Already being ordered

      // 2. Create a new DRAFT Purchase Order
      const orderQty = Math.max(product.maxStock - availability, product.minStock);
      
      const newPO = await prisma.purchaseOrder.create({
        data: {
          vendorId: product.vendorId,
          vendorName: product.vendor.name,
          vendorAddress: product.vendor.address,
          status: 'DRAFT',
          totalAmount: orderQty * product.costPrice,
          orderLines: {
            create: [{
              productId: product.id,
              quantity: orderQty,
              price: product.costPrice,
              initialPrice: product.costPrice
            }]
          }
        }
      });

      if (userId || true) { // Log as System if no userId
        await logActivity(
          userId || 'SYSTEM', 
          'AUTO_REPLENISH', 
          'PURCHASE_ORDER', 
          newPO.id, 
          `Auto-generated PO for ${product.name} due to low stock (${availability} < ${product.minStock})`
        );
      }
    }
  }
}
