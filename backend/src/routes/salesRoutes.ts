import { Router } from 'express';
import { createSalesOrder, confirmSalesOrder, getSalesOrders } from '../controllers/salesController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, createSalesOrder);
router.get('/', getSalesOrders);
router.post('/:id/confirm', authenticate, confirmSalesOrder);

export default router;
