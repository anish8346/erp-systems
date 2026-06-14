import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller.js';
import { authenticate } from '../../../core/middlewares/authMiddleware.js';

export const financeRouter = Router();

financeRouter.get('/summary', authenticate, FinanceController.getFinanceSummary);
financeRouter.post('/record', authenticate, FinanceController.logManualRecord);
