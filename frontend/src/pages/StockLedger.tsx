
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, ArrowUpRight, ArrowDownRight, Search, Filter } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI';
import type { StockLedger as StockLedgerType } from '../types';

const StockLedger = () => {
  const [ledger, setLedger] = useState<StockLedgerType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLedger = async () => {
    try {
      const res = await api.get('/products/ledger');
      setLedger(res.data);
    } catch (err) {
      console.error("Failed to fetch stock ledger", err);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const filteredLedger = ledger.filter(entry => 
    (entry.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.referenceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">Stock Ledger</h2>
          <p className="text-warm-taupe text-sm font-medium">Complete traceability of every stock movement and adjustment.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-soft-cream flex items-center gap-2">
            <History className="w-4 h-4 text-luxury-brown" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Full Traceability</span>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-lg bg-white/50 backdrop-blur-md">
        <div className="p-4 border-b border-soft-cream bg-white flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-taupe/60" />
            <input 
              placeholder="Search by product, type or reference..." 
              className="w-full pl-10 pr-4 py-2 bg-faded-white border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-brown/20 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" size="sm" className="font-semibold">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-faded-white/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60">Product</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60">Event Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60 text-center">Quantity Change</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60 text-right">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLedger.map((entry) => (
                <tr key={entry.id} className="group hover:bg-faded-white/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-luxury-brown">{new Date(entry.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] font-bold text-warm-taupe/60">{new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-luxury-brown">{entry.product?.name || 'Unknown Product'}</p>
                    <p className="text-[10px] text-warm-taupe/60 font-mono">{entry.product?.id.slice(0,8)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      entry.type.includes('PURCHASE') || entry.type.includes('PRODUCE') || entry.type.includes('IN') 
                      ? 'success' 
                      : entry.type.includes('ADJUST') 
                      ? 'warning' 
                      : 'danger'
                    }>
                      {entry.type.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center justify-center font-bold">
                       {entry.quantityChange > 0 ? (
                         <div className="flex items-center text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                           <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                           <span>+{entry.quantityChange}</span>
                         </div>
                       ) : (
                         <div className="flex items-center text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                           <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
                           <span>{entry.quantityChange}</span>
                         </div>
                       )}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-[11px] font-bold text-warm-taupe bg-gray-100 px-2 py-1 rounded-lg">
                      REF-{entry.referenceId.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLedger.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-warm-taupe/60 font-bold text-lg">No stock movements found</p>
                    <p className="text-warm-taupe/60 text-sm mt-1">Stock activities will appear here as they happen.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StockLedger;
