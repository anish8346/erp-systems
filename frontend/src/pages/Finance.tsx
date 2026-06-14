import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Wallet, TrendingUp, TrendingDown, IndianRupee, Search, Filter, ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { Card, Button, Badge, Modal, Input, ConfirmDialog } from '../components/UI';
import type { PaginationMeta } from '../types';

const Finance = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState({ income: 0, expense: 0, netProfit: 0 });
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 20, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
  });

  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    category: 'OTHER',
    amount: 0,
    description: '',
  });

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/finance/summary', { params: filters });
      setRecords(res.data.records);
      setStats(res.data.stats);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to fetch finance data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [filters]);

  const handleReset = () => {
    setFilters({
      page: 1,
      type: 'all',
      category: 'all',
      startDate: '',
      endDate: '',
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/record', formData);
      setShowModal(false);
      setFormData({ type: 'EXPENSE', category: 'OTHER', amount: 0, description: '' });
      fetchFinanceData();
    } catch (err) {
      alert("Failed to log record");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">Financial Ledger</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Monitor real-time cash flow, revenue, and business expenses.</p>
        </div>
        <Button onClick={() => setShowModal(true)} variant="primary" className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Log Manual Entry
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-none shadow-sm p-6">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Income</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">₹{stats.income.toLocaleString()}</p>
             </div>
             <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp className="w-5 h-5" />
             </div>
          </div>
        </Card>
        <Card className="bg-white border-none shadow-sm p-6">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Expenses</p>
                <p className="text-2xl font-black text-rose-600 mt-1">₹{stats.expense.toLocaleString()}</p>
             </div>
             <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                <TrendingDown className="w-5 h-5" />
             </div>
          </div>
        </Card>
        <Card className="bg-white border-none shadow-sm p-6">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Net Profit / Loss</p>
                <p className={`text-2xl font-black mt-1 ${stats.netProfit >= 0 ? 'text-luxury-brown' : 'text-rose-700'}`}>
                    ₹{stats.netProfit.toLocaleString()}
                </p>
             </div>
             <div className={`p-2 rounded-lg ${stats.netProfit >= 0 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                <Wallet className="w-5 h-5" />
             </div>
          </div>
        </Card>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none outline-none focus:ring-1 focus:ring-gray-300 font-medium"
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value, page: 1})}
                >
                    <option value="all">All Types</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                </select>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none outline-none focus:ring-1 focus:ring-gray-300 font-medium"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value, page: 1})}
                >
                    <option value="all">All Categories</option>
                    <option value="SALES">Sales Revenue</option>
                    <option value="PURCHASE">Procurement</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="date"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-300"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value, page: 1})}
                />
            </div>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="date"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-300"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value, page: 1})}
                />
            </div>
            <Button variant="secondary" size="sm" onClick={handleReset} className="h-full">
                Reset
            </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">Date</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">Description & Ref</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-center">Category</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan={4} className="py-20 text-center text-gray-400 font-bold">Syncing ledger...</td></tr>
                ) : records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 font-medium">{new Date(r.date).toLocaleDateString()}</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-sm">{r.description}</span>
                                <span className="text-[10px] font-mono text-gray-400">REF: {r.referenceId || 'MANUAL'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <Badge variant={r.type === 'INCOME' ? 'success' : 'danger'}>{r.category}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <span className={`text-sm font-black ${r.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {r.type === 'INCOME' ? '+' : '-'} ₹{r.amount.toLocaleString()}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400">
            Total <span className="text-gray-900">{pagination.totalItems}</span> transactions
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={pagination.page === 1 || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="px-2 h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(Math.max(0, pagination.totalPages))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    pagination.page === i + 1 
                      ? 'bg-gray-800 text-white shadow-sm' 
                      : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={pagination.page === pagination.totalPages || loading}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="px-2 h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Manual Finance Entry">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 ml-1">Transaction Type</label>
                    <select 
                        className="px-4 py-2.5 border border-gray-300 rounded-lg outline-none transition-all bg-white text-sm font-medium"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                        <option value="INCOME">Income (+)</option>
                        <option value="EXPENSE">Expense (-)</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 ml-1">Category</label>
                    <select 
                        className="px-4 py-2.5 border border-gray-300 rounded-lg outline-none transition-all bg-white text-sm font-medium"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    >
                        <option value="SALES">Sales Revenue</option>
                        <option value="PURCHASE">Procurement</option>
                        <option value="OTHER">Other Expense</option>
                    </select>
                </div>
            </div>
            <Input 
                label="Amount (₹) *" 
                type="number"
                value={formData.amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, amount: Number(e.target.value)})}
                required
            />
            <Input 
                label="Description *" 
                placeholder="e.g. Utility bill payment"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, description: e.target.value})}
                required
            />
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Post Transaction</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Finance;
