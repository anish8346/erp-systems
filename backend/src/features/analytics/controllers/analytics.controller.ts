import type { Response } from 'express';
import type { AuthRequest } from '../../../core/middlewares/authMiddleware.js';
import { AnalyticsService } from '../services/analytics.service.js';

export const getFinancialSummary = async (req: AuthRequest, res: Response) => {
  try {
    const summary = await AnalyticsService.getFinancialSummary();
    res.json(summary);
  } catch (error: unknown) {
    console.error('[FinanceSummary Error]:', error);
    res.status(500).json({ error: 'Failed to calculate financial metrics.' });
  }
};
