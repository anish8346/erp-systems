import type { Request, Response } from 'express';
import type { AuthRequest } from '../../../core/middlewares/authMiddleware.js';
import { OperationsService } from '../services/operations.service.js';

export class OperationsController {
  static async createBoM(req: Request, res: Response) {
    try {
      const bom = await OperationsService.createBoM(req.body);
      res.status(201).json(bom);
    } catch (error: any) {
      console.error("BoM Creation Error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getBoMs(req: Request, res: Response) {
    try {
      const boms = await OperationsService.getBoMs();
      res.json(boms);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createMO(req: AuthRequest, res: Response) {
    try {
      const { productId, quantity, bomId } = req.body;
      if (!productId || !bomId) {
        return res.status(400).json({ error: 'Product and BoM are required to plan production.' });
      }
      
      const mo = await OperationsService.createMO({
          productId,
          quantity,
          bomId,
          userId: req.user?.id
      });

      res.status(201).json(mo);
    } catch (error: any) {
      console.error('[CreateMO Error]:', error);
      res.status(500).json({ error: 'Failed to create manufacturing order.' });
    }
  }

  static async produceMO(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await OperationsService.produceMO(id, req.user?.id);
      res.json(result);
    } catch (error: any) {
      console.error('[ProduceMO Error]:', error);
      res.status(500).json({ error: error.message || 'Failed to finalize production.' });
    }
  }

  static async updateWorkOrderStatus(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const wo = await OperationsService.updateWorkOrderStatus(id, status, req.user?.id);
      res.json(wo);
    } catch (error: any) {
      console.error('[UpdateWOStatus Error]:', error);
      res.status(500).json({ error: 'Failed to update work step status.' });
    }
  }

  static async getMOs(req: Request, res: Response) {
    try {
      const mos = await OperationsService.getMOs();
      res.json(mos);
    } catch (error: any) {
      console.error('[GetMOs Error]:', error);
      res.status(500).json({ error: 'Failed to retrieve manufacturing orders.' });
    }
  }
}
