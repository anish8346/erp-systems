import prisma from '../../../core/database/prisma.js';
import { salesRepository } from '../repositories/sales.repository.js';
import { logActivity } from '../../../core/utils/logger.js';
import { AutomationService } from '../../../core/utils/automation.js';
import { FinanceService } from '../../finance/services/finance.service.js';
import type { CreateSalesOrderData, CreateSalesOrderLine, DeliverItem } from '../../../core/types/index.js';

export const createSalesOrder = async (data: CreateSalesOrderData & { customerId?: string }, userId?: string) => {
  const { customerName, customerAddress, salesPersonId, orderLines, customerId } = data;
  if (!customerName || !orderLines?.length) {
    throw new Error('Customer name and at least one product are required.');
  }
  
  const totalAmount = orderLines.reduce((acc: number, line: CreateSalesOrderLine) => acc + (line.quantity * line.price), 0);
  
  const so = await salesRepository.createSalesOrder({ 
    customerName, 
    customerAddress, 
    salesPersonId: salesPersonId && salesPersonId.trim() !== '' ? salesPersonId : undefined, 
    orderLines, 
    totalAmount,
    customerId: customerId && customerId.trim() !== '' ? customerId : undefined
  });

  if (userId) {
    await logActivity(userId, 'CREATE', 'SALES_ORDER', so.id, `Created draft sales order for ${customerName}`);
  }
  
  return so;
};

export const confirmSalesOrder = async (id: string, userId?: string) => {
  const so = await salesRepository.findSalesOrderById(id);
  
  if (!so) throw new Error('Sales Order not found.');
  if (so.status !== 'DRAFT' && so.status !== 'NEGOTIATION') throw new Error('Only DRAFT or NEGOTIATION orders can be confirmed.');

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

export const startNegotiation = async (id: string, userId?: string) => {
  const so = await salesRepository.findSalesOrderById(id);
  if (!so) throw new Error('Sales Order not found.');
  if (so.status !== 'DRAFT') throw new Error('Only DRAFT orders can be moved to negotiation.');

  await salesRepository.updateSalesOrder(id, { status: 'NEGOTIATION' });

  if (userId) {
    await logActivity(userId, 'START_NEGOTIATION', 'SALES_ORDER', id, `Started negotiation for sales order ${id}`);
  }

  return await salesRepository.findSalesOrderById(id);
};

export const addNegotiationComment = async (id: string, text: string, userId: string) => {
  const so = await salesRepository.findSalesOrderById(id);
  if (!so) throw new Error('Sales Order not found.');

  await salesRepository.addComment({ salesOrderId: id, userId, text });

  await logActivity(userId, 'COMMENT', 'SALES_ORDER', id, `Added negotiation comment: ${text.substring(0, 50)}...`);

  return await salesRepository.findSalesOrderById(id);
};

export const updateNegotiatedPrice = async (id: string, lineId: string, newPrice: number, userId: string) => {
  const so = await salesRepository.findSalesOrderById(id);
  if (!so) throw new Error('Sales Order not found.');
  if (so.status !== 'NEGOTIATION' && so.status !== 'DRAFT') throw new Error('Can only update price in DRAFT or NEGOTIATION status.');

  return await prisma.$transaction(async (tx) => {
    const line = await tx.salesOrderLine.findUnique({ where: { id: lineId } });
    if (!line || line.salesOrderId !== id) throw new Error('Order line not found.');

    await tx.salesOrderLine.update({
      where: { id: lineId },
      data: { price: newPrice }
    });

    const allLines = await tx.salesOrderLine.findMany({
      where: { salesOrderId: id }
    });
    
    const totalAmount = allLines.reduce((acc, l) => acc + (l.quantity * l.price), 0);

    await tx.salesOrder.update({
      where: { id },
      data: { totalAmount }
    });

    await logActivity(userId, 'UPDATE_PRICE', 'SALES_ORDER', id, `Updated sales price for a line item to ₹${newPrice}`);

    return await tx.salesOrder.findUnique({
      where: { id },
      include: { 
        orderLines: { include: { product: true } }, 
        salesPerson: true,
        comments: { include: { user: true }, orderBy: { createdAt: 'asc' } }
      }
    });
  });
};

export const deliverSalesOrder = async (id: string, items: DeliverItem[], userId?: string) => {
  const so = await salesRepository.findSalesOrderById(id);
  
  if (!so) throw new Error('Sales Order not found.');
  if (so.status !== 'CONFIRMED' && so.status !== 'PARTIALLY_DELIVERED') {
    throw new Error('Order must be CONFIRMED or PARTIALLY_DELIVERED for dispatch.');
  }

  await salesRepository.deliverOrderTransaction(so as any, items);

  // AUTOMATION: Log income for delivered items
  let deliveredValue = 0;
  for (const item of items) {
    const line = so.orderLines.find(l => l.id === item.lineId);
    if (line) {
        deliveredValue += (item.quantity * line.price);
        await AutomationService.triggerSmartReplenishment(line.productId, userId);
    }
  }

  if (deliveredValue > 0) {
      const timestamp = new Date().toLocaleTimeString();
      await FinanceService.logIncome(
          deliveredValue, 
          'SALES', 
          `${id}:${Date.now()}`, 
          `Shipment for ${so.customerName} (at ${timestamp})`,
          userId
      );
  }

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

export const getSalesOrderById = async (id: string) => {
  return await salesRepository.findSalesOrderById(id);
};
