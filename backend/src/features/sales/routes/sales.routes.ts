import { Router } from 'express';
import { createSalesOrder, getSalesOrders, confirmOrder, deliverOrder, cancelOrder } from '../controllers/sales.controller.js';
import { CustomerController } from '../controllers/customer.controller.js';
import { authenticate } from '../../../core/middlewares/authMiddleware.js';

export const salesRouter = Router();

salesRouter.post('/', authenticate, createSalesOrder);
salesRouter.get('/', authenticate, getSalesOrders);
salesRouter.post('/:id/confirm', authenticate, confirmOrder);
salesRouter.post('/:id/negotiate', authenticate, startNegotiation);
salesRouter.post('/:id/comment', authenticate, addComment);
salesRouter.patch('/:id/line/:lineId', authenticate, updateLinePrice);
salesRouter.post('/:id/deliver', authenticate, deliverOrder);
salesRouter.post('/:id/cancel', authenticate, cancelOrder);

export const customerRouter = Router();
customerRouter.post('/', authenticate, CustomerController.createCustomer);
customerRouter.get('/', authenticate, CustomerController.getCustomers);
customerRouter.patch('/:id', authenticate, CustomerController.updateCustomer);
customerRouter.delete('/:id', authenticate, CustomerController.deleteCustomer);
