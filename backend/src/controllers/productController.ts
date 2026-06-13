import type { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { logActivity } from '../utils/logger.js';

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, salesPrice, costPrice, procurementType, supplyMethod, vendorId, bomId, qtyOnHand } = req.body;
    if (!name) return res.status(400).json({ error: 'Product name is required.' });

    const initialQty = Number(qtyOnHand) || 0;

    const product = await prisma.product.create({
      data: {
        name,
        salesPrice: Number(salesPrice) || 0,
        costPrice: Number(costPrice) || 0,
        procurementType: procurementType || 'MTS',
        supplyMethod: supplyMethod || 'PURCHASE',
        vendorId: vendorId || null,
        bomId,
        qtyOnHand: initialQty,
        qtyReserved: 0,
      },
    });

    if (req.user) {
      await logActivity(req.user.id, 'CREATE', 'PRODUCT', product.id, `Created product: ${product.name} with initial stock ${initialQty}`);
    }

    if (initialQty > 0) {
      await prisma.stockLedger.create({
        data: {
          productId: product.id,
          quantityChange: initialQty,
          type: 'INITIAL',
          referenceId: 'INITIAL_STOCK',
        }
      });
    }

    res.status(201).json(product);
  } catch (error: any) {
    console.error('[CreateProduct Error]:', error);
    res.status(500).json({ error: 'Failed to create product. Database error.' });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
        include: { vendor: true }
    });
    res.json(products);
  } catch (error: any) {
    console.error('[GetProducts Error]:', error);
    res.status(500).json({ error: 'Failed to fetch inventory list.' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: true,
        BoM: {
          include: {
            bomLines: {
              include: { component: true }
            }
          }
        }
      }
    });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(product);
  } catch (error: any) {
    console.error('[GetProductById Error]:', error);
    res.status(500).json({ error: 'Error retrieving product details.' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, salesPrice, costPrice, procurementType, supplyMethod, vendorId } = req.body;
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        salesPrice: Number(salesPrice),
        costPrice: Number(costPrice),
        procurementType,
        supplyMethod,
        vendorId: vendorId || null,
      },
    });

    if (req.user) {
      await logActivity(req.user.id, 'UPDATE', 'PRODUCT', id, `Updated product details for ${name}`);
    }

    res.json(product);
  } catch (error: any) {
    console.error('[UpdateProduct Error]:', error);
    res.status(500).json({ error: 'Failed to update product details.' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const linesCount = await prisma.salesOrderLine.count({ where: { productId: id } });
    if (linesCount > 0) {
      return res.status(400).json({ error: 'Cannot delete: This product has historical Sales Orders linked to it.' });
    }

    const product = await prisma.product.delete({ where: { id } });

    if (req.user) {
      await logActivity(req.user.id, 'DELETE', 'PRODUCT', id, `Deleted product: ${product.name}`);
    }

    res.json({ message: 'Product deleted successfully.' });
  } catch (error: any) {
    console.error('[DeleteProduct Error]:', error);
    res.status(500).json({ error: 'System could not delete the product.' });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { adjustment, reason } = req.body; 
    
    if (!adjustment || isNaN(Number(adjustment))) {
      return res.status(400).json({ error: 'A valid adjustment quantity is required.' });
    }

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id },
        data: { qtyOnHand: { increment: Number(adjustment) } }
      });

      await tx.stockLedger.create({
        data: {
          productId: id,
          quantityChange: Number(adjustment),
          type: 'ADJUSTMENT',
          referenceId: reason || 'MANUAL_ADJUSTMENT',
        }
      });

      return p;
    });

    if (req.user) {
      await logActivity(req.user.id, 'ADJUST_STOCK', 'PRODUCT', id, `Manually adjusted stock for ${product.name} by ${adjustment}. Reason: ${reason}`);
    }

    res.json(product);
  } catch (error: any) {
    console.error('[AdjustStock Error]:', error);
    res.status(500).json({ error: 'Failed to apply stock adjustment.' });
  }
};

export const getStockLedger = async (req: Request, res: Response) => {
  try {
    const ledger = await prisma.stockLedger.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(ledger);
  } catch (error: any) {
    console.error('[GetLedger Error]:', error);
    res.status(500).json({ error: 'Failed to retrieve stock ledger.' });
  }
};
