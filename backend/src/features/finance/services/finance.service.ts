import { FinanceRepository } from '../repositories/finance.repository.js';
import { logActivity } from '../../../core/utils/logger.js';

export class FinanceService {
  static async logIncome(amount: number, category: 'SALES' | 'OTHER', referenceId?: string, description?: string, userId?: string) {
    const record = await FinanceRepository.createRecord({
      type: 'INCOME',
      category,
      amount,
      referenceId,
      description,
    });

    if (userId) {
      await logActivity(userId, 'FINANCE_INCOME', 'FINANCE', record.id, `Logged income of ₹${amount} (${category})`);
    }

    return record;
  }

  static async logExpense(amount: number, category: 'PURCHASE' | 'OTHER', referenceId?: string, description?: string, userId?: string) {
    const record = await FinanceRepository.createRecord({
      type: 'EXPENSE',
      category,
      amount,
      referenceId,
      description,
    });

    if (userId) {
      await logActivity(userId, 'FINANCE_EXPENSE', 'FINANCE', record.id, `Logged expense of ₹${amount} (${category})`);
    }

    return record;
  }

  static async getSummary(filters: any) {
    return await FinanceRepository.findRecords(filters);
  }

  static async getChartData() {
    return await FinanceRepository.getChartData();
  }
}
