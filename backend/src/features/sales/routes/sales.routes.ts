import { Router } from 'express';
import { createSalesOrder, getSalesOrders, confirmOrder, deliverOrder } from '../controllers/sales.controller.js';
import { authenticate } from '../../../core/middlewares/authMiddleware.js';

export const salesRouter = Router();

salesRouter.post('/', authenticate, createSalesOrder);
salesRouter.get('/', authenticate, getSalesOrders);
salesRouter.post('/:id/confirm', authenticate, confirmOrder);
salesRouter.post('/:id/deliver', authenticate, deliverOrder);
