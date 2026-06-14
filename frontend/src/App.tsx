
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Truck, Factory, History, ListTree, LogOut, Settings, Inbox, ShieldAlert, UserPlus, Sofa, Wallet } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Boms from './pages/Boms';
import Sales from './pages/Sales';
import Purchase from './pages/Purchase';
import Manufacturing from './pages/Manufacturing';
import StockLedger from './pages/StockLedger';
import Login from './pages/Login';
import AuditLogs from './pages/AuditLogs';
import Config from './pages/Config';
import Users from './pages/Users';
import Customers from './pages/Customers';
import Finance from './pages/Finance';
import Requests from './pages/Requests';
import Vendors from './pages/Vendors';
import LandingPage from './pages/LandingPage';
import { Toaster, toast } from 'react-hot-toast';
import api from './services/api';
import type { User, Product } from './types';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [lastAlerted, setLastAlerted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!token || !user) return;
    
    const checkLowStock = async () => {
        try {
            const res = await api.get('/products/low-stock');
            const lowStockItems = res.data as Product[];
            
            lowStockItems.forEach(item => {
                if (!lastAlerted.has(item.id)) {
                    toast.error(
                        (t) => (
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-sm">Low Stock Warning!</span>
                                <span className="text-xs opacity-90">{item.name} is at {item.qtyOnHand} units (Min: {item.minStock})</span>
                                <button 
                                    onClick={() => toast.dismiss(t.id)}
                                    className="text-[10px] font-black uppercase mt-1 self-end hover:underline"
                                >
                                    Dismiss
                                </button>
                            </div>
                        ),
                        { duration: 6000, id: `stock-${item.id}` }
                    );
                    setLastAlerted(prev => {
                        const next = new Set(prev);
                        next.add(item.id);
                        return next;
                    });
                }
            });
        } catch (err) {
            console.error("Stock check failed", err);
        }
    };

    checkLowStock();
    const interval = setInterval(checkLowStock, 60000); // Every minute
    return () => clearInterval(interval);
  }, [token, user, lastAlerted]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const canAccess = (roles: string[]) => {
    return user && (user.role === 'ADMIN' || roles.includes(user.role));
  };

  if (!token || !user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-faded-white text-luxury-brown">
        {/* Professional Sidebar */}
        <aside className="w-64 bg-luxury-brown text-faded-white flex flex-col shadow-xl z-20">
          <div className="p-6 mb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-white/10 rounded-lg">
                <Sofa className="w-5 h-5 text-faded-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Shiv Furniture</h1>
            </div>
            <p className="text-[11px] text-white/40 font-semibold tracking-wider ml-1">Enterprise ERP</p>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2 mt-4">Operations</p>
            
            <NavItem to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
            
            {canAccess(['INVENTORY', 'OWNER']) && (
              <NavItem to="/dashboard/products" icon={<Package className="w-4 h-4" />} label="Inventory" />
            )}

            {canAccess(['MFG', 'OWNER']) && (
              <>
                <NavItem to="/dashboard/boms" icon={<ListTree className="w-4 h-4" />} label="BoM Engineering" />
                <NavItem to="/dashboard/manufacturing" icon={<Factory className="w-4 h-4" />} label="Manufacturing" />
              </>
            )}

            {canAccess(['SALES', 'OWNER']) && (
              <>
                <NavItem to="/dashboard/sales" icon={<ShoppingCart className="w-4 h-4" />} label="Sales Orders" />
                <NavItem to="/dashboard/customers" icon={<UserPlus className="w-4 h-4" />} label="Customers" />
              </>
            )}

            {canAccess(['PURCHASE', 'OWNER']) && (
              <>
                <NavItem to="/dashboard/purchase" icon={<Truck className="w-4 h-4" />} label="Procurement" />
                <NavItem to="/dashboard/vendors" icon={<UserPlus className="w-4 h-4" />} label="Vendors" />
              </>
            )}

            <NavItem to="/dashboard/ledger" icon={<History className="w-4 h-4" />} label="Stock Ledger" />

            {user.role === 'ADMIN' && (
              <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">System</p>
                <NavItem to="/dashboard/requests" icon={<Inbox className="w-4 h-4" />} label="Access Requests" />
                <NavItem to="/dashboard/users" icon={<UserPlus className="w-4 h-4" />} label="Staff Management" />
                <NavItem to="/dashboard/finance" icon={<Wallet className="w-4 h-4" />} label="Financial Ledger" />
                <NavItem to="/dashboard/audit-logs" icon={<ShieldAlert className="w-4 h-4" />} label="Audit Logs" />
                <NavItem to="/dashboard/config" icon={<Settings className="w-4 h-4" />} label="Configuration" />
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-white/5">
             <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                   {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold truncate">{user.name}</p>
                   <p className="text-[10px] text-white/40 font-semibold">{user.role}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 text-white/40 hover:text-rose-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
           <div className="max-w-6xl mx-auto p-8 lg:p-12 min-h-full">
              <Routes>
                <Route path="/dashboard" element={<div className="animate-in fade-in duration-500"><Outlet /></div>}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="boms" element={<Boms />} />
                  <Route path="sales" element={<Sales />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="purchase" element={<Purchase />} />
                  <Route path="vendors" element={<Vendors />} />
                  <Route path="finance" element={<Finance />} />
                  <Route path="manufacturing" element={<Manufacturing />} />
                  <Route path="ledger" element={<StockLedger />} />
                  <Route path="requests" element={<Requests />} />
                  <Route path="users" element={<Users />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                  <Route path="config" element={<Config />} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
           </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => (
  <Link 
    to={to} 
    className="flex items-center gap-3 px-3 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all group font-semibold text-[14px]"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default App;
