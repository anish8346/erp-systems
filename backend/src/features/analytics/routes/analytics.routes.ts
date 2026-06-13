import { Router } from 'express';
import { getFinancialSummary } from '../controllers/analytics.controller.js';
import { authenticate } from '../../../core/middlewares/authMiddleware.js';

export const financeRouter = Router();

financeRouter.get('/summary', authenticate, getFinancialSummary);
