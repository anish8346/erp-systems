import React from 'react';
import { Search, Filter, ShoppingBag, ChevronRight, Calendar, User as UserIcon, ChevronLeft, Clock } from 'lucide-react';
import { Badge, Button } from '../../components/UI';
import type { SalesOrder, PaginationMeta } from '../../types';

interface SalesListProps {
  orders: SalesOrder[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  onOpenDetail: (order: SalesOrder) => void;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onReset: () => void;
  loading: boolean;
}

const SalesList = ({ 
  orders, 
  searchTerm, 
  onSearchChange, 
  statusFilter,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onOpenDetail,
  pagination,
  onPageChange,
  onReset,
  loading
}: SalesListProps) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-500">
      {/* Filters Bar */}
      <div className="p-4 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            placeholder="Search customer/order..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-gray-300 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none outline-none focus:ring-1 focus:ring-gray-300"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PARTIALLY_DELIVERED">Partially Shipped</option>
            <option value="DELIVERED">Fully Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="date"
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-300"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="date"
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-gray-300"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>

        <Button variant="secondary" size="sm" onClick={onReset} className="h-[38px] font-bold text-xs uppercase tracking-wider">
           Reset Filters
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/30">
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">Customer & Order</th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">Date</th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-right">Amount</th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-center">Status</th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
                <tr>
                    <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-luxury-brown/20 border-t-luxury-brown rounded-full animate-spin"></div>
                            <p className="text-gray-400 font-bold">Synchronizing orders...</p>
                        </div>
                    </td>
                </tr>
            ) : (
                <>
                {orders.map((o) => {
                   const isDelayed = o.status === 'CONFIRMED' && (new Date().getTime() - new Date(o.createdAt).getTime() > 2 * 24 * 60 * 60 * 1000);
                   return (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            o.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 
                            o.status === 'CANCELLED' ? 'bg-gray-50 text-gray-400' :
                            'bg-indigo-50 text-indigo-600'
                        }`}>
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{o.customerName}</span>
                            <span className="text-[10px] font-mono text-gray-400 mt-0.5">ORD-{o.id.slice(0,8).toUpperCase()}</span>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                            {isDelayed && (
                                <span className="text-[9px] font-black text-rose-600 uppercase mt-1">Delayed Shipment</span>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-gray-900">₹{o.totalAmount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <Badge variant={
                            o.status === 'DELIVERED' ? 'success' : 
                            o.status === 'PARTIALLY_DELIVERED' ? 'warning' : 
                            o.status === 'NEGOTIATION' ? 'orange' :
                            o.status === 'CANCELLED' ? 'neutral' :
                            'purple'
                        }>
                        {o.status.replace('_', ' ')}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {(o.status === 'DRAFT' || o.status === 'NEGOTIATION') && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); onOpenDetail(o); }}
                             className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                           >
                             Bargain
                           </button>
                        )}
                        <button 
                        onClick={() => onOpenDetail(o)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                        >
                        View <ChevronRight className="w-4 h-4" />
                        </button>
                    </td>
                    </tr>
                )})}
                {orders.length === 0 && (
                    <tr>
                    <td colSpan={5} className="py-20 text-center">
                        <ShoppingBag className="w-10 h-10 text-gray-100 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm font-medium">No sales orders found.</p>
                    </td>
                    </tr>
                )}
                </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400">
            Showing <span className="text-gray-900">{orders.length}</span> of <span className="text-gray-900">{pagination.totalItems}</span> orders
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={pagination.page === 1 || loading}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-2 h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 || 
                  pageNum === pagination.totalPages || 
                  (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        pagination.page === pageNum 
                          ? 'bg-gray-800 text-white shadow-sm' 
                          : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === pagination.page - 2 || 
                  pageNum === pagination.page + 2
                ) {
                  return <span key={pageNum} className="text-gray-400 text-xs mx-0.5">...</span>;
                }
                return null;
              })}
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={pagination.page === pagination.totalPages || loading}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-2 h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
    </div>
  );
};

export default SalesList;
