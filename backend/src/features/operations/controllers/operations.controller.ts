import type { Response } from 'express';
import type { AuthRequest } from '../../../core/middlewares/authMiddleware.js';
import { OperationsService } from '../services/operations.service.js';

export class OperationsController {
  static async createMO(req: AuthRequest, res: Response) {
    try {
      const mo = await OperationsService.createMO(req.body, req.user?.id);
      res.status(201).json(mo);
    } catch (error: unknown) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async confirmMO(req: AuthRequest, res: Response) {
    try {
      const mo = await OperationsService.confirmMO(req.params.id, req.user?.id);
      res.json(mo);
    } catch (error: unknown) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async produceMO(req: AuthRequest, res: Response) {
    try {
      const result = await OperationsService.produceMO(req.params.id, req.user?.id);
      res.json(result);
    } catch (error: unknown) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async cancelMO(req: AuthRequest, res: Response) {
    try {
      const mo = await OperationsService.cancelMO(req.params.id, req.user?.id);
      res.json(mo);
    } catch (error: unknown) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async getMOs(req: AuthRequest, res: Response) {
    try {
      const mos = await OperationsService.getMOs();
      res.json(mos);
    } catch (error: unknown) {
      console.error('[GetMOs Error]:', error);
      res.status(500).json({ error: 'Failed to fetch manufacturing orders.' });
    }
  }

  static async updateWorkOrderStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      const wo = await OperationsService.updateWorkOrderStatus(req.params.id, status, req.user?.id);
      res.json(wo);
    } catch (error: unknown) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async updateWorkOrderDuration(req: AuthRequest, res: Response) {
    try {
      const { realDuration } = req.body;
      const wo = await OperationsService.updateWorkOrderDuration(req.params.id, realDuration, req.user?.id);
      res.json(wo);
    } catch (error: unknown) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async updateComponentConsumed(req: AuthRequest, res: Response) {
    try {
      const { consumed } = req.body;
      const comp = await OperationsService.updateComponentConsumed(req.params.id, consumed, req.user?.id);
      res.json(comp);
    } catch (error: unknown) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }
}
