import { Router } from 'express';
import prisma from '../../../core/database/prisma.js';
import { createProduct, getProducts, getProductById, getStockLedger, updateProduct, deleteProduct, adjustStock } from '../controllers/inventory.controller.js';
import { authenticate } from '../../../core/middlewares/authMiddleware.js';

export const productRouter = Router();

productRouter.post('/', authenticate, createProduct);
productRouter.get('/', authenticate, getProducts);
productRouter.get('/low-stock', authenticate, async (req, res) => {
    try {
        const result = await prisma.product.findMany({
            where: {
                AND: [
                    { minStock: { gt: 0 } },
                    { 
                        OR: [
                            { qtyOnHand: { lt: prisma.product.fields.minStock } }
                        ]
                    }
                ]
            }
        });
        // Actually simpler comparison in JS after fetch or using raw query
        // Let's just fetch all with minStock > 0 and filter in service
        const products = await prisma.product.findMany({ where: { minStock: { gt: 0 } } });
        const lowStock = products.filter(p => p.qtyOnHand < p.minStock);
        res.json(lowStock);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch low stock alert.' });
    }
});
productRouter.get('/ledger', authenticate, getStockLedger);
productRouter.get('/:id', authenticate, getProductById);
productRouter.put('/:id', authenticate, updateProduct);
productRouter.delete('/:id', authenticate, deleteProduct);
productRouter.patch('/:id/adjust-stock', authenticate, adjustStock);
