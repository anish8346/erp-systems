import type { Response } from 'express';
import type { AuthRequest } from '../../../core/middlewares/authMiddleware.js';
import * as salesService from '../services/sales.service.js';

export const createSalesOrder = async (req: AuthRequest, res: Response) => {
  try {
    const so = await salesService.createSalesOrder(req.body, req.user?.id);
    res.status(201).json(so);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getSalesOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await salesService.getSalesOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch sales orders.' });
  }
};

export const confirmOrder = async (req: AuthRequest, res: Response) => {
  try {
    const so = await salesService.confirmSalesOrder(req.params.id, req.user?.id);
    res.json(so);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deliverOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body;
    await salesService.deliverSalesOrder(req.params.id, items, req.user?.id);
    res.json({ message: 'Delivery processed successfully.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
