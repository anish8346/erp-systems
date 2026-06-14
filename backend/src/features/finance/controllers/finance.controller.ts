import type { Request, Response } from 'express';
import type { AuthRequest } from '../../../core/middlewares/authMiddleware.js';
import { FinanceService } from '../services/finance.service.js';

export class FinanceController {
  static async getFinanceSummary(req: AuthRequest, res: Response) {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        type: req.query.type as string,
        category: req.query.category as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const result = await FinanceService.getSummary(filters);
      res.json(result);
    } catch (error: unknown) {
      res.status(500).json({ error: 'Failed to fetch financial summary.' });
    }
  }

  static async logManualRecord(req: AuthRequest, res: Response) {
    try {
      const { type, amount, category, description } = req.body;
      let record;
      if (type === 'INCOME') {
        record = await FinanceService.logIncome(amount, category, undefined, description, req.user?.id);
      } else {
        record = await FinanceService.logExpense(amount, category, undefined, description, req.user?.id);
      }
      res.status(201).json(record);
    } catch (error: unknown) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async getCharts(req: AuthRequest, res: Response) {
    try {
      const data = await FinanceService.getChartData();
      res.json(data);
    } catch (error: unknown) {
      res.status(500).json({ error: 'Failed to fetch chart data.' });
    }
  }
}
