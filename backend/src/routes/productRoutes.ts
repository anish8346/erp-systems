import { Router } from 'express';
import { createProduct, getProducts, getProductById, getStockLedger } from '../controllers/productController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, createProduct);
router.get('/', getProducts);
router.get('/ledger', getStockLedger);
router.get('/:id', getProductById);

export default router;
