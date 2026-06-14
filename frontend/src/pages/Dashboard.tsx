
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingCart, Truck, Factory, AlertTriangle, Package, History } from 'lucide-react';
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
  const [recentLogs, setRecentLogs] = useState<StockLedger[]>([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [salesRes, productsRes, mosRes, ledgerRes] = await Promise.all([
          api.get('/sales'),
          api.get('/products'),
          api.get('/manufacturing'),
          api.get('/products/ledger'),
        ]);

        const salesData = Array.isArray(salesRes.data) ? salesRes.data : (salesRes.data?.orders || []);
        const productsData = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.products || []);
        const mosData = Array.isArray(mosRes.data) ? mosRes.data : (mosRes.data?.mos || []);
        const ledgerData = Array.isArray(ledgerRes.data) ? ledgerRes.data : (ledgerRes.data?.ledger || []);

        const confirmedSales = salesData.filter((s: SalesOrder) => s.status === 'CONFIRMED' || s.status === 'PARTIALLY_DELIVERED');
        const lowStockItems = productsData.filter((p: Product) => (p.qtyOnHand - p.qtyReserved) <= 0);
        const activeMFG = mosData.filter((m: ManufacturingOrder) => m.status !== 'DONE');

        const delayedOrdersCount = confirmedSales.filter((s: SalesOrder) => {
          return new Date().getTime() - new Date(s.createdAt).getTime() > 2 * 24 * 60 * 60 * 1000;
        }).length;

        setStats({
          totalSales: salesData.length,
          pendingDeliveries: confirmedSales.length,
          activeMOs: activeMFG.length,
          lowStock: lowStockItems.length,
          delayedOrders: delayedOrdersCount,
        });
        setRecentLogs(ledgerData.slice(0, 5));
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
        <p className="text-warm-taupe mt-2 text-sm font-semibold opacity-70">Real-time Operational Overview</p>
      </div>
      
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

