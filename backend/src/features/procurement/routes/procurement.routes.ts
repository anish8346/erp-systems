import { Router } from 'express';
import { ProcurementController } from '../controllers/procurement.controller.js';
import { authenticate } from '../../../core/middlewares/authMiddleware.js';

export const purchaseRouter = Router();
purchaseRouter.post('/', authenticate, ProcurementController.createPurchaseOrder);
purchaseRouter.get('/', ProcurementController.getPurchaseOrders);
purchaseRouter.post('/:id/receive', authenticate, ProcurementController.receivePurchaseOrder);

export const vendorRouter = Router();
vendorRouter.post('/', authenticate, ProcurementController.createVendor);
vendorRouter.get('/', authenticate, ProcurementController.getVendors);
vendorRouter.put('/:id', authenticate, ProcurementController.updateVendor);
