import { Router } from 'express';
import { createProduct, getProducts, getProductById, getStockLedger, updateProduct, deleteProduct, adjustStock } from '../controllers/inventory.controller.js';
import { authenticate } from '../../../core/middlewares/authMiddleware.js';

export const productRouter = Router();

productRouter.post('/', authenticate, createProduct);
productRouter.get('/', getProducts);
productRouter.get('/ledger', getStockLedger);
productRouter.get('/:id', getProductById);
productRouter.put('/:id', authenticate, updateProduct);
productRouter.delete('/:id', authenticate, deleteProduct);
productRouter.patch('/:id/adjust-stock', authenticate, adjustStock);
