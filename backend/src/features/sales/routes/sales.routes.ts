import { Router } from 'express';
import { createSalesOrder, getSalesOrders, confirmOrder, deliverOrder, cancelOrder, startNegotiation, addComment, updateLinePrice, downloadInvoice } from '../controllers/sales.controller.js';
import { CustomerController } from '../controllers/customer.controller.js';
import { authenticate, authorize } from '../../../core/middlewares/authMiddleware.js';

export const salesRouter = Router();

salesRouter.post('/', authenticate, authorize(['SALES']), createSalesOrder);
salesRouter.get('/', authenticate, authorize(['SALES', 'INVENTORY', 'MFG', 'PURCHASE']), getSalesOrders);
salesRouter.get('/:id', authenticate, authorize(['SALES', 'INVENTORY', 'MFG', 'PURCHASE']), async (req, res, next) => {
    // Helper to get single SO which was missing from basic routes
    const { getSalesOrderById } = await import('../services/sales.service.js');
    try {
        const so = await getSalesOrderById(req.params.id);
        res.json(so);
    } catch (e) { next(e); }
});
salesRouter.post('/:id/confirm', authenticate, authorize(['SALES']), confirmOrder);
salesRouter.post('/:id/negotiate', authenticate, authorize(['SALES']), startNegotiation);
salesRouter.post('/:id/comment', authenticate, authorize(['SALES']), addComment);
salesRouter.patch('/:id/line/:lineId', authenticate, authorize(['SALES']), updateLinePrice);
salesRouter.post('/:id/deliver', authenticate, authorize(['SALES', 'INVENTORY']), deliverOrder);
salesRouter.post('/:id/cancel', authenticate, authorize(['SALES']), cancelOrder);
salesRouter.get('/:id/download', authenticate, downloadInvoice);

export const customerRouter = Router();
customerRouter.post('/', authenticate, authorize(['SALES']), CustomerController.createCustomer);
customerRouter.get('/', authenticate, CustomerController.getCustomers);
customerRouter.patch('/:id', authenticate, authorize(['SALES']), CustomerController.updateCustomer);
customerRouter.delete('/:id', authenticate, authorize([]), CustomerController.deleteCustomer);
