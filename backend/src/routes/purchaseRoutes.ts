import { Router } from 'express';
import { createPurchaseOrder, receivePurchaseOrder, getPurchaseOrders } from '../controllers/purchaseController';

const router = Router();

router.post('/', createPurchaseOrder);
router.get('/', getPurchaseOrders);
router.post('/:id/receive', receivePurchaseOrder);

export default router;
