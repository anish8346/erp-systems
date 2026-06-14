import prisma from '../../../core/database/prisma.js';

export class FinanceRepository {
  static async createRecord(data: {
    type: 'INCOME' | 'EXPENSE';
    category: 'SALES' | 'PURCHASE' | 'OTHER';
    amount: number;
    referenceId?: string;
    description?: string;
    date?: Date;
  }) {
    return await prisma.financeRecord.create({
      data: {
        type: data.type,
        category: data.category,
        amount: data.amount,
        referenceId: data.referenceId,
        description: data.description,
        date: data.date || new Date(),
      }
    });
  }

  static async findRecords(filters: {
    page: number;
    limit: number;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page, limit, type, category, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type && type !== 'all') where.type = type;
    if (category && category !== 'all') where.category = category;

    if ((startDate && startDate.trim() !== '') || (endDate && endDate.trim() !== '')) {
      where.date = {};
      if (startDate && startDate.trim() !== '') {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) where.date.gte = start;
      }
      if (endDate && endDate.trim() !== '') {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          where.date.lte = end;
        }
      }
      if (Object.keys(where.date).length === 0) delete where.date;
    }

    const [records, totalItems, summary] = await Promise.all([
      prisma.financeRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.financeRecord.count({ where }),
      prisma.financeRecord.groupBy({
        by: ['type'],
        where,
        _sum: { amount: true },
      }),
    ]);

    const stats = {
      income: summary.find(s => s.type === 'INCOME')?._sum.amount || 0,
      expense: summary.find(s => s.type === 'EXPENSE')?._sum.amount || 0,
    };

    return {
      records,
      stats: {
        ...stats,
        netProfit: stats.income - stats.expense,
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    };
  }
}
