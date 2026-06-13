import { salesRepository } from '../repositories/sales.repository.js';
import { logActivity } from '../../../core/utils/logger.js';

export const createSalesOrder = async (data: any, userId?: string) => {
  const { customerName, orderLines } = data;
  if (!customerName || !orderLines?.length) {
    throw new Error('Customer name and at least one product are required.');
  }
  
  const totalAmount = orderLines.reduce((acc: number, line: any) => acc + (line.quantity * line.price), 0);
  
  const so = await salesRepository.createSalesOrder({ customerName, orderLines, totalAmount });

  if (userId) {
    await logActivity(userId, 'CREATE', 'SALES_ORDER', so.id, `Created draft sales order for ${customerName}`);
  }
  
  return so;
};

export const confirmSalesOrder = async (id: string, userId?: string) => {
  const so = await salesRepository.findSalesOrderById(id);
  
  if (!so) throw new Error('Sales Order not found.');
  if (so.status !== 'DRAFT') throw new Error('Only DRAFT orders can be confirmed.');

  for (const line of so.orderLines) {
    const product = line.product;
    const freeToUse = product.qtyOnHand - product.qtyReserved;
    
    if (freeToUse >= line.quantity) {
      await salesRepository.updateProductReservedQty(product.id, line.quantity);
    } else {
      const shortage = line.quantity - freeToUse;
      
      if (freeToUse > 0) {
         await salesRepository.updateProductReservedQty(product.id, freeToUse);
      }

      if (product.procurementType === 'MTO') {
        if (product.supplyMethod === 'MANUFACTURE' && product.bomId) {
          await salesRepository.createManufacturingOrder({
            productId: product.id,
            quantity: shortage,
            status: 'CONFIRMED',
            bomId: product.bomId,
          });
        } else if (product.supplyMethod === 'PURCHASE') {
          await salesRepository.createPurchaseOrder({
            vendorName: 'Auto-Generated Vendor',
            status: 'DRAFT',
            totalAmount: shortage * product.costPrice,
            orderLines: {
              create: [{
                productId: product.id,
                quantity: shortage,
                price: product.costPrice,
              }]
            }
          });
        }
      }
    }
  }

  const updatedSO = await salesRepository.updateSalesOrderStatus(id, 'CONFIRMED');

  if (userId) {
      await logActivity(userId, 'CONFIRM', 'SALES_ORDER', id, `Confirmed sales order for ${so.customerName}`);
  }

  return updatedSO;
};

export const deliverSalesOrder = async (id: string, items: any[], userId?: string) => {
  const so = await salesRepository.findSalesOrderById(id);
  
  if (!so) throw new Error('Sales Order not found.');
  if (so.status !== 'CONFIRMED' && so.status !== 'PARTIALLY_DELIVERED') {
    throw new Error('Order must be CONFIRMED or PARTIALLY_DELIVERED for dispatch.');
  }

  await salesRepository.deliverOrderTransaction(so, items);

  if (userId) {
      await logActivity(userId, 'DELIVER', 'SALES_ORDER', id, `Processed dispatch for order ${so.customerName}`);
  }
};

export const getSalesOrders = async () => {
  return await salesRepository.findAllSalesOrders();
};
