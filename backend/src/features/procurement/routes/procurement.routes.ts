import { Router } from 'express';
import { ProcurementController } from '../controllers/procurement.controller.js';
import { authenticate } from '../../../core/middlewares/authMiddleware.js';

export const purchaseRouter = Router();
purchaseRouter.post('/', authenticate, ProcurementController.createPurchaseOrder);
purchaseRouter.get('/', ProcurementController.getPurchaseOrders);
purchaseRouter.post('/:id/confirm', authenticate, ProcurementController.confirmPurchaseOrder);
purchaseRouter.post('/:id/negotiate', authenticate, ProcurementController.startNegotiation);
purchaseRouter.post('/:id/comment', authenticate, ProcurementController.addComment);
purchaseRouter.patch('/:id/line/:lineId', authenticate, ProcurementController.updateLinePrice);
purchaseRouter.post('/:id/cancel', authenticate, ProcurementController.cancelPurchaseOrder);
purchaseRouter.post('/:id/receive', authenticate, ProcurementController.receivePurchaseOrder);
purchaseRouter.get('/:id/download', authenticate, ProcurementController.downloadPO);

export const vendorRouter = Router();
vendorRouter.post('/', authenticate, ProcurementController.createVendor);
vendorRouter.get('/', authenticate, ProcurementController.getVendors);
vendorRouter.put('/:id', authenticate, ProcurementController.updateVendor);
