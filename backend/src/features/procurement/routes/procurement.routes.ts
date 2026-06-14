import { Router } from 'express';
import { ProcurementController } from '../controllers/procurement.controller.js';
import { authenticate, authorize } from '../../../core/middlewares/authMiddleware.js';

export const purchaseRouter = Router();
purchaseRouter.post('/', authenticate, authorize(['PURCHASE', 'INVENTORY']), ProcurementController.createPurchaseOrder);
purchaseRouter.get('/', authenticate, authorize(['PURCHASE', 'INVENTORY', 'MFG', 'SALES']), ProcurementController.getPurchaseOrders);
purchaseRouter.post('/:id/confirm', authenticate, authorize(['PURCHASE']), ProcurementController.confirmPurchaseOrder);
purchaseRouter.post('/:id/negotiate', authenticate, authorize(['PURCHASE']), ProcurementController.startNegotiation);
purchaseRouter.post('/:id/comment', authenticate, authorize(['PURCHASE']), ProcurementController.addComment);
purchaseRouter.patch('/:id/line/:lineId', authenticate, authorize(['PURCHASE']), ProcurementController.updateLinePrice);
purchaseRouter.post('/:id/cancel', authenticate, authorize(['PURCHASE']), ProcurementController.cancelPurchaseOrder);
purchaseRouter.post('/:id/receive', authenticate, authorize(['PURCHASE', 'INVENTORY']), ProcurementController.receivePurchaseOrder);
purchaseRouter.get('/:id/download', authenticate, ProcurementController.downloadPO);

export const vendorRouter = Router();
vendorRouter.post('/', authenticate, authorize(['PURCHASE', 'INVENTORY']), ProcurementController.createVendor);
vendorRouter.get('/', authenticate, authorize(['PURCHASE', 'INVENTORY', 'MFG', 'SALES']), ProcurementController.getVendors);
vendorRouter.put('/:id', authenticate, authorize(['PURCHASE', 'INVENTORY']), ProcurementController.updateVendor);
vendorRouter.delete('/:id', authenticate, authorize([]), async (req, res) => {
    // Basic delete for vendors, only admin/owner
    try {
        const { id } = req.params;
        await (await import('../../../core/database/prisma.js')).default.vendor.delete({ where: { id } });
        res.json({ message: 'Vendor deleted' });
    } catch (e) { res.status(400).json({ error: 'Delete failed' }); }
});
