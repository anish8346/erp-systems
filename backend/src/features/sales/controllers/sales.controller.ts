import type { Response } from 'express';
import type { AuthRequest } from '../../../core/middlewares/authMiddleware.js';
import * as salesService from '../services/sales.service.js';

export const createSalesOrder = async (req: AuthRequest, res: Response) => {
  try {
    const so = await salesService.createSalesOrder(req.body, req.user?.id);
    res.status(201).json(so);
  } catch (error: unknown) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
};

export const getSalesOrders = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      searchTerm: req.query.searchTerm as string,
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
    const result = await salesService.getSalesOrders(filters);
    res.json(result);
  } catch (error: unknown) {
    console.error('[GetSalesOrders Error]:', error);
    res.status(500).json({ error: 'Failed to fetch sales orders.' });
  }
};

export const confirmOrder = async (req: AuthRequest, res: Response) => {
  try {
    const so = await salesService.confirmSalesOrder(req.params.id, req.user?.id);
    res.json(so);
  } catch (error: unknown) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
};

export const startNegotiation = async (req: AuthRequest, res: Response) => {
  try {
    const so = await salesService.startNegotiation(req.params.id, req.user?.id);
    res.json(so);
  } catch (error: unknown) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { text } = req.body;
    if (!req.user?.id) throw new Error('User not authenticated.');
    const so = await salesService.addNegotiationComment(id, text, req.user.id);
    res.status(201).json(so);
  } catch (error: unknown) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
};

export const updateLinePrice = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const lineId = req.params.lineId;
    const { price } = req.body;
    if (!req.user?.id) throw new Error('User not authenticated.');
    const so = await salesService.updateNegotiatedPrice(id, lineId, Number(price), req.user.id);
    res.json(so);
  } catch (error: unknown) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
};

export const deliverOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body;
    await salesService.deliverSalesOrder(req.params.id, items, req.user?.id);
    res.json({ message: 'Delivery processed successfully.' });
  } catch (error: unknown) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const so = await salesService.cancelSalesOrder(req.params.id, req.user?.id);
    res.json(so);
  } catch (error: unknown) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
};
