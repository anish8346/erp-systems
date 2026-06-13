import { salesRepository } from '../repositories/sales.repository.js';
import { logActivity } from '../../../core/utils/logger.js';
import type { CreateSalesOrderData, CreateSalesOrderLine, DeliverItem } from '../../../core/types/index.js';

export const createSalesOrder = async (data: CreateSalesOrderData, userId?: string) => {
  const { customerName, customerAddress, salesPersonId, orderLines } = data;
  if (!customerName || !orderLines?.length) {
    throw new Error('Customer name and at least one product are required.');
  }
  
  const totalAmount = orderLines.reduce((acc: number, line: CreateSalesOrderLine) => acc + (line.quantity * line.price), 0);
  
  const so = await salesRepository.createSalesOrder({ 
    customerName, 
    customerAddress, 
    salesPersonId, 
    orderLines, 
    totalAmount 
  });

  if (userId) {
    await logActivity(userId, 'CREATE', 'SALES_ORDER', so.id, `Created draft sales order for ${customerName}`);
  }
  
  return so;
};

export const confirmSalesOrder = async (id: string, userId?: string) => {
  const so = await salesRepository.findSalesOrderById(id);
  
  if (!so) throw new Error('Sales Order not found.');
  if (so.status !== 'DRAFT') throw new Error('Only DRAFT orders can be confirmed.');

  for (const line of (so.orderLines || [])) {
    const product = line.product;
    if (!product) continue;
    
    const freeToUse = product.qtyOnHand - product.qtyReserved;
    const qtyToReserve = Math.min(line.quantity, Math.max(0, freeToUse));
    const shortage = line.quantity - qtyToReserve;
    
    // 1. Reserve what is available
    if (qtyToReserve > 0) {
      await salesRepository.updateProductReservedQty(product.id, qtyToReserve);
    }

    // 2. Trigger MTO if needed
    if (shortage > 0 && product.procurementType === 'MTO') {
      if (product.supplyMethod === 'MANUFACTURE' && product.bomId) {
        await salesRepository.createManufacturingOrder({
          productId: product.id,
          quantity: shortage,
          status: 'CONFIRMED',
          bomId: product.bomId,
        });
      } else if (product.supplyMethod === 'PURCHASE' && product.vendorId) {
        // Fetch vendor for details
        const vendor = await prisma.vendor.findUnique({ where: { id: product.vendorId } });
        
        await salesRepository.createPurchaseOrder({
          vendorId: product.vendorId,
          vendorName: vendor?.name || 'Auto-Generated Vendor',
          vendorAddress: vendor?.address || '',
          status: 'DRAFT',
          totalAmount: shortage * product.costPrice,
          orderLines: {
            create: [{
              productId: product.id,
              quantity: shortage,
              price: product.costPrice,
              initialPrice: product.costPrice
            }]
          }
        });
      }
    }
  }

  const updatedSO = await salesRepository.updateSalesOrderStatus(id, 'CONFIRMED');

  if (userId) {
      await logActivity(userId, 'CONFIRM', 'SALES_ORDER', id, `Confirmed sales order for ${so.customerName}`);
  }

  return updatedSO;
};

export const deliverSalesOrder = async (id: string, items: DeliverItem[], userId?: string) => {
  const so = await salesRepository.findSalesOrderById(id);
  
  if (!so) throw new Error('Sales Order not found.');
  if (so.status !== 'CONFIRMED' && so.status !== 'PARTIALLY_DELIVERED') {
    throw new Error('Order must be CONFIRMED or PARTIALLY_DELIVERED for dispatch.');
  }

  await salesRepository.deliverOrderTransaction(so as any, items);

  if (userId) {
      await logActivity(userId, 'DELIVER', 'SALES_ORDER', id, `Processed dispatch for order ${so.customerName}`);
  }
};

export const cancelSalesOrder = async (id: string, userId?: string) => {
  const so = await salesRepository.findSalesOrderById(id);
  if (!so) throw new Error('Sales Order not found.');
  if (so.status === 'DELIVERED') throw new Error('Cannot cancel a fully delivered order.');

  const updatedSO = await salesRepository.cancelSalesOrder(id);

  if (userId) {
    await logActivity(userId, 'CANCEL', 'SALES_ORDER', id, `Cancelled sales order for ${so.customerName}`);
  }

  return updatedSO;
};

export const getSalesOrders = async (filters: { 
  page: number; 
  limit: number; 
  searchTerm?: string; 
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return await salesRepository.findAllSalesOrders(filters);
};
