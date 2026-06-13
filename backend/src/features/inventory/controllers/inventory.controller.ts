import type { Request, Response } from 'express';
import type { AuthRequest } from '../../../core/middlewares/authMiddleware.js';
import * as inventoryService from '../services/inventory.service.js';

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await inventoryService.createProduct(req.body, req.user?.id);
    res.status(201).json(product);
  } catch (error: any) {
    console.error('[CreateProduct Error]:', error);
    res.status(error.message === 'Product name is required.' ? 400 : 500).json({ error: error.message || 'Failed to create product.' });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await inventoryService.getAllProducts();
    res.json(products);
  } catch (error: any) {
    console.error('[GetProducts Error]:', error);
    res.status(500).json({ error: 'Failed to fetch inventory list.' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await inventoryService.getProductById(req.params.id);
    res.json(product);
  } catch (error: any) {
    console.error('[GetProductById Error]:', error);
    res.status(error.message === 'Product not found.' ? 404 : 500).json({ error: error.message || 'Error retrieving product details.' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await inventoryService.updateProduct(req.params.id, req.body, req.user?.id);
    res.json(product);
  } catch (error: any) {
    console.error('[UpdateProduct Error]:', error);
    res.status(500).json({ error: 'Failed to update product details.' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    await inventoryService.deleteProduct(req.params.id, req.user?.id);
    res.json({ message: 'Product deleted successfully.' });
  } catch (error: any) {
    console.error('[DeleteProduct Error]:', error);
    res.status(error.message.includes('Cannot delete') ? 400 : 500).json({ error: error.message || 'System could not delete the product.' });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const { adjustment, reason } = req.body;
    const product = await inventoryService.adjustStock(req.params.id, Number(adjustment), reason, req.user?.id);
    res.json(product);
  } catch (error: any) {
    console.error('[AdjustStock Error]:', error);
    res.status(error.message.includes('valid adjustment') ? 400 : 500).json({ error: error.message || 'Failed to apply stock adjustment.' });
  }
};

export const getStockLedger = async (req: Request, res: Response) => {
  try {
    const ledger = await inventoryService.getStockLedger();
    res.json(ledger);
  } catch (error: any) {
    console.error('[GetLedger Error]:', error);
    res.status(500).json({ error: 'Failed to retrieve stock ledger.' });
  }
};
