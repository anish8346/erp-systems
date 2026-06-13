
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingCart, Truck, Factory, AlertTriangle, TrendingUp, Package, History, IndianRupee, TrendingDown, Wallet } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI';
import type { SalesOrder, Product, ManufacturingOrder, StockLedger } from '../types';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingDeliveries: 0,
    activeMOs: 0,
    lowStock: 0,
    delayedOrders: 0,
  });
  const [finance, setFinance] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  });
  const [recentLogs, setRecentLogs] = useState<StockLedger[]>([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sales, products, mos, ledger] = await Promise.all([
          api.get('/sales'),
          api.get('/products'),
          api.get('/manufacturing'),
          api.get('/products/ledger'),
        ]);

        if (['OWNER', 'ADMIN'].includes(user.role)) {
          const finRes = await api.get('/finance/summary');
          setFinance(finRes.data);
        }

        const confirmedSales = (sales.data || []).filter((s: SalesOrder) => s.status === 'CONFIRMED' || s.status === 'PARTIALLY_DELIVERED');
        const lowStockItems = (products.data || []).filter((p: Product) => (p.qtyOnHand - p.qtyReserved) <= 0);
        const activeMFG = (mos.data || []).filter((m: ManufacturingOrder) => m.status !== 'DONE');

        const delayedOrdersCount = confirmedSales.filter((s: SalesOrder) => {
          return new Date().getTime() - new Date(s.createdAt).getTime() > 2 * 24 * 60 * 60 * 1000;
        }).length;

        setStats({
          totalSales: (sales.data || []).length,
          pendingDeliveries: confirmedSales.length,
          activeMOs: activeMFG.length,
          lowStock: lowStockItems.length,
          delayedOrders: delayedOrdersCount,
        });
        setRecentLogs((ledger.data || []).slice(0, 5));
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-luxury-brown"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-luxury-brown leading-none">Dashboard</h2>
        <p className="text-warm-taupe mt-2 text-sm font-semibold opacity-70">Real-time Command Overview</p>
      </div>
      
      {/* Financial Section (Restricted) */}
      {['OWNER', 'ADMIN'].includes(user.role) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-luxury-brown p-10 rounded-2xl shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-furniture-gold/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
           
           <div className="md:col-span-3 mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-xl flex items-center gap-3">
                  <Wallet className="w-6 h-6 text-furniture-gold" />
                  Financial Performance
                </h3>
                <p className="text-faded-white/40 text-[10px] font-semibold uppercase tracking-wider mt-1.5 ml-9">Liquidity analysis based on deliveries</p>
              </div>
              <Badge variant="gold">Profit Metrics</Badge>
           </div>

           <FinanceCard 
              label="Total Revenue" 
              value={finance.totalRevenue} 
              icon={<IndianRupee className="w-5 h-5" />} 
              sub="Delivered Goods"
              color="text-emerald-400"
           />
           <FinanceCard 
              label="Total Costs" 
              value={finance.totalExpenses} 
              icon={<TrendingDown className="w-5 h-5" />} 
              sub="Material Procurement"
              color="text-rose-400"
           />
           <FinanceCard 
              label="Net Cash Flow" 
              value={finance.netProfit} 
              icon={<TrendingUp className="w-5 h-5" />} 
              sub="Current Margin"
              color={finance.netProfit >= 0 ? "text-furniture-gold" : "text-rose-400"}
              isBold
           />
        </div>
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Orders" 
          value={stats.totalSales} 
          icon={<ShoppingCart className="w-6 h-6" />} 
          color="brown" 
          trend="+12% Trend"
        />
        <KPICard 
          title="To Deliver" 
          value={stats.pendingDeliveries} 
          icon={<Truck className="w-6 h-6" />} 
          color="taupe" 
          trend={`${stats.delayedOrders > 0 ? `${stats.delayedOrders} delayed` : 'On track'}`}
        />
        <KPICard 
          title="Active MOs" 
          value={stats.activeMOs} 
          icon={<Factory className="w-6 h-6" />} 
          color="gold" 
          trend="Production Active"
        />
        <KPICard 
          title="Stock Alerts" 
          value={stats.lowStock} 
          icon={<AlertTriangle className="w-6 h-6" />} 
          color="red" 
          trend="Immediate Action"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <Card title="Recent Stock Movements" subtitle="Last 5 verified inventory changes" className="lg:col-span-3">
          <div className="space-y-4">
            {recentLogs.map((log: StockLedger) => (
              <div key={log.id} className="flex items-center justify-between p-4 hover:bg-faded-white rounded-2xl transition-all border border-transparent hover:border-[#e8e4db]">
                <div className="flex items-center gap-5">
                  <div className={`p-3 rounded-xl ${log.quantityChange > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} border border-current/10`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-luxury-brown text-sm">{log.product?.name || 'Unknown Product'}</p>
                    <p className="text-[10px] text-warm-taupe font-semibold mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <p className={`font-bold text-lg leading-none ${log.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                  </p>
                  <Badge variant="neutral">{log.type}</Badge>
                </div>
              </div>
            ))}
            {recentLogs.length === 0 && <p className="text-center py-10 text-warm-taupe font-medium text-sm">No inventory activity recorded.</p>}
          </div>
          <Button variant="secondary" className="w-full mt-10 text-[11px] font-semibold" onClick={() => window.location.href='/dashboard/ledger'}>
            <History className="w-4 h-4 mr-2" /> View Complete Ledger
          </Button>
        </Card>
      </div>
    </div>
  );
};

interface FinanceCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  sub: string;
  color: string;
  isBold?: boolean;
}

const FinanceCard = ({ label, value, icon, sub, color, isBold }: FinanceCardProps) => (
  <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
    <div className="flex items-center gap-3 mb-4">
       <div className={`p-2.5 rounded-xl bg-white/10 ${color} border border-white/10`}>
          {icon}
       </div>
       <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    </div>
    <p className={`text-3xl ${isBold ? 'font-bold' : 'font-semibold'} text-white`}>₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
    <p className="text-white/20 text-[10px] mt-2 font-semibold uppercase tracking-wider">{sub}</p>
  </div>
);

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'brown' | 'taupe' | 'gold' | 'red';
  trend: string;
}

const KPICard = ({ title, value, icon, color, trend }: KPICardProps) => {
  const colors: Record<string, string> = {
    brown: "text-luxury-brown bg-white border-[#e8e4db]",
    taupe: "text-warm-taupe bg-white border-[#e8e4db]",
    gold: "text-furniture-gold bg-white border-[#e8e4db]",
    red: "text-rose-600 bg-white border-rose-100",
  };

  return (
    <div className={`p-8 rounded-2xl border shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 duration-500 ${colors[color]}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3.5 rounded-xl border border-current/10 bg-faded-white`}>
          {icon}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-40">{title}</span>
      </div>
      <div className="mt-4">
        <p className="text-4xl font-bold text-luxury-brown leading-none">{value}</p>
        <div className="flex items-center gap-2 mt-3">
           <div className="w-1 h-1 rounded-full bg-current opacity-30"></div>
           <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60">{trend}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

