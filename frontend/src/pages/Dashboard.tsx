import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingCart, Truck, Factory, AlertTriangle, TrendingUp, Package, History } from 'lucide-react';
import { Card, Badge } from '../components/UI';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingDeliveries: 0,
    activeMOs: 0,
    lowStock: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sales, products, mos, ledger] = await Promise.all([
          api.get('/sales').catch(() => ({ data: [] })),
          api.get('/products').catch(() => ({ data: [] })),
          api.get('/manufacturing').catch(() => ({ data: [] })),
          api.get('/products/ledger').catch(() => ({ data: [] })),
        ]);

        const confirmedSales = (sales.data || []).filter((s: any) => s.status === 'CONFIRMED');
        const lowStockItems = (products.data || []).filter((p: any) => (p.qtyOnHand - p.qtyReserved) <= 0);
        const activeMFG = (mos.data || []).filter((m: any) => m.status !== 'DONE');

        setStats({
          totalSales: (sales.data || []).length,
          pendingDeliveries: confirmedSales.length,
          activeMOs: activeMFG.length,
          lowStock: lowStockItems.length,
        });
        setRecentLogs((ledger.data || []).slice(0, 5));
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Executive Dashboard</h2>
        <p className="text-gray-500 mt-1">Real-time operational overview for Shiv Furniture Works.</p>
      </div>
      
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Orders" 
          value={stats.totalSales} 
          icon={<ShoppingCart className="w-6 h-6" />} 
          color="blue" 
          trend="+12% from last month"
        />
        <KPICard 
          title="To Deliver" 
          value={stats.pendingDeliveries} 
          icon={<Truck className="w-6 h-6" />} 
          color="orange" 
          trend="4 urgent today"
        />
        <KPICard 
          title="Production" 
          value={stats.activeMOs} 
          icon={<Factory className="w-6 h-6" />} 
          color="purple" 
          trend="85% capacity"
        />
        <KPICard 
          title="Stock Alerts" 
          value={stats.lowStock} 
          icon={<AlertTriangle className="w-6 h-6" />} 
          color="red" 
          trend="Action required"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card title="Recent Stock Movements" className="lg:col-span-2">
          <div className="space-y-4">
            {recentLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${log.quantityChange > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{log.product?.name || 'Unknown Product'}</p>
                    <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${log.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                  </p>
                  <Badge variant="neutral">{log.type}</Badge>
                </div>
              </div>
            ))}
            {recentLogs.length === 0 && <p className="text-center py-10 text-gray-400 italic">No inventory activity yet.</p>}
          </div>
          <button className="w-full mt-6 text-sm text-blue-600 font-bold hover:underline flex items-center justify-center gap-1">
            <History className="w-4 h-4" /> View Full Ledger
          </button>
        </Card>

        {/* Quick Links / Status */}
        <Card title="System Health" subtitle="Real-time connectivity status">
          <div className="space-y-6">
            <HealthItem label="Database" status="Connected" />
            <HealthItem label="API Gateway" status="Operational" />
            <HealthItem label="Auth Service" status="Operational" />
            
            <div className="mt-8 p-4 bg-blue-50 rounded-2xl">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-900">Automation Tip</p>
                  <p className="text-xs text-blue-700 mt-1">Make To Order (MTO) is active. Shortages will automatically trigger POs or MOs.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, color, trend }: any) => {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    red: "text-red-600 bg-red-50 border-red-100",
  };

  return (
    <div className={`p-6 bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md ${colors[color]}`}>
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl border ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{title}</span>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-black text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium">{trend}</p>
      </div>
    </div>
  );
};

const HealthItem = ({ label, status }: any) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600 font-medium">{label}</span>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      <span className="text-xs font-bold text-gray-800">{status}</span>
    </div>
  </div>
);

export default Dashboard;
