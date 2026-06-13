import type { Response, Request } from 'express';
import type { AuthRequest } from '../../../core/middlewares/authMiddleware.js';
import { ProcurementService } from '../services/procurement.service.js';

export class ProcurementController {
  static async createPurchaseOrder(req: AuthRequest, res: Response) {
    try {
      const po = await ProcurementService.createPurchaseOrder(req.body, req.user?.id);
      res.status(201).json(po);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create procurement order.';
      console.error('[CreatePO Error]:', error);
      res.status(500).json({ error: message });
    }
  }

  static async receivePurchaseOrder(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { items } = req.body;
      await ProcurementService.receivePurchaseOrder(id, items, req.user?.id);
      res.json({ message: 'Receipt processed successfully.' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to process goods receipt.';
      console.error('[ReceivePO Error]:', error);
      res.status(500).json({ error: message });
    }
  }

  static async getPurchaseOrders(req: Request, res: Response) {
    try {
      const orders = await ProcurementService.getPurchaseOrders();
      res.json(orders);
    } catch (error: unknown) {
      console.error('[GetPOs Error]:', error);
      res.status(500).json({ error: 'Failed to retrieve procurement orders.' });
    }
  }

  static async createVendor(req: AuthRequest, res: Response) {
    try {
      const vendor = await ProcurementService.createVendor(req.body, req.user?.id);
      res.status(201).json(vendor);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create vendor.';
      res.status(500).json({ error: message });
    }
  }

  static async getVendors(req: AuthRequest, res: Response) {
    try {
      const vendors = await ProcurementService.getVendors();
      res.json(vendors);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve vendors.';
      res.status(500).json({ error: message });
    }
  }

  static async updateVendor(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const vendor = await ProcurementService.updateVendor(id, req.body, req.user?.id);
      res.json(vendor);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update vendor.';
      res.status(500).json({ error: message });
    }
  }
}
