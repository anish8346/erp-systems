import { AnalyticsRepository } from '../repositories/analytics.repository.js';

export class AnalyticsService {
  static async getFinancialSummary() {
    const salesLines = await AnalyticsRepository.getAllSalesLines();
    const totalRevenue = salesLines.reduce((acc, line) => acc + (line.deliveredQty * line.price), 0);

    const purchaseLines = await AnalyticsRepository.getAllPurchaseLines();
    const totalExpenses = purchaseLines.reduce((acc, line) => acc + (line.receivedQty * line.price), 0);

    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      currency: 'INR'
    };
  }
}
