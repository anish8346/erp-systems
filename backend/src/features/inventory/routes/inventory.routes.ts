import { Router } from 'express';
import prisma from '../../../core/database/prisma.js';
import { createProduct, getProducts, getProductById, getStockLedger, updateProduct, deleteProduct, adjustStock } from '../controllers/inventory.controller.js';
import { authenticate, authorize } from '../../../core/middlewares/authMiddleware.js';

export const productRouter = Router();

productRouter.post('/', authenticate, authorize(['INVENTORY', 'MFG']), createProduct);
productRouter.get('/', authenticate, authorize(['INVENTORY', 'MFG', 'SALES', 'PURCHASE']), getProducts);
productRouter.get('/low-stock', authenticate, authorize(['INVENTORY', 'MFG', 'SALES', 'PURCHASE']), async (req, res) => {
    try {
        // Fetch all with minStock > 0 and filter in service
        const products = await prisma.product.findMany({ where: { minStock: { gt: 0 } } });
        const lowStock = products.filter(p => p.qtyOnHand < p.minStock);
        res.json(lowStock);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch low stock alert.' });
    }
});
productRouter.get('/ledger', authenticate, authorize(['INVENTORY', 'MFG', 'SALES', 'PURCHASE']), getStockLedger);
productRouter.get('/:id', authenticate, authorize(['INVENTORY', 'MFG', 'SALES', 'PURCHASE']), getProductById);
productRouter.put('/:id', authenticate, authorize(['INVENTORY', 'MFG']), updateProduct);
productRouter.delete('/:id', authenticate, authorize([]), deleteProduct); 
productRouter.patch('/:id/adjust-stock', authenticate, authorize(['INVENTORY', 'MFG']), adjustStock);
