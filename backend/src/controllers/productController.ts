import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import { logActivity } from '../utils/logger';

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, salesPrice, costPrice, procurementType, supplyMethod, vendorId, bomId, qtyOnHand } = req.body;
    const initialQty = Number(qtyOnHand) || 0;

    const product = await prisma.product.create({
      data: {
        name,
        salesPrice,
        costPrice,
        procurementType,
        supplyMethod,
        vendorId,
        bomId,
        qtyOnHand: initialQty,
        qtyReserved: 0,
      },
    });

    // Log the activity
    if (req.user) {
      await logActivity(req.user.id, 'CREATE', 'PRODUCT', product.id, `Created product: ${product.name} with initial stock ${initialQty}`);
    }

    // If initial stock is provided, create a ledger entry
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
    res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        BoM: {
          include: {
            bomLines: {
              include: { component: true }
            }
          }
        }
      }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
};
