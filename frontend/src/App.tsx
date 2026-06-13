import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Truck, Factory, History, ListTree, LogOut, Settings, ShieldAlert, Zap, UserPlus, Inbox } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Purchase from './pages/Purchase';
import Manufacturing from './pages/Manufacturing';
import Boms from './pages/Boms';
import StockLedger from './pages/StockLedger';
import Login from './pages/Login';
import AuditLogs from './pages/AuditLogs';
import Config from './pages/Config';
import Users from './pages/Users';
import Requests from './pages/Requests';
import LandingPage from './pages/LandingPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser({});
    window.location.href = '/';
  };

  const canAccess = (roles: string[]) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role) || user.role === 'ADMIN';
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        <Route 
          path="/dashboard/*" 
          element={
            token ? (
              <div className="flex h-screen bg-[#f8fafc]">
                <aside className="w-72 bg-[#0f172a] text-white shadow-2xl z-20 flex flex-col">
                  <div className="p-8 border-b border-slate-800/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap className="text-white w-6 h-6 fill-current" />
                      </div>
                      <span className="text-2xl font-black tracking-tighter">Shiv<span className="text-blue-400">Furniture</span></span>
                    </div>
                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Authenticated As</p>
                      <p className="text-sm font-bold text-slate-200 truncate">{user.name || 'User'}</p>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">{user.role || 'Guest'}</p>
                    </div>
                  </div>
                  
                  <nav className="mt-6 px-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                    <NavItem to="/dashboard" icon={<LayoutDashboard />} label="Overview" end />
                    
                    {canAccess(['INVENTORY', 'OWNER']) && (
                      <NavItem to="/dashboard/products" icon={<Package />} label="Inventory" color="text-emerald-400" />
                    )}

                    {canAccess(['MFG', 'OWNER']) && (
                      <>
                        <NavItem to="/dashboard/boms" icon={<ListTree />} label="BoM Engineering" color="text-indigo-400" />
                        <NavItem to="/dashboard/manufacturing" icon={<Factory />} label="Manufacturing" color="text-indigo-400" />
                      </>
                    )}

                    {canAccess(['SALES', 'OWNER']) && (
                      <NavItem to="/dashboard/sales" icon={<ShoppingCart />} label="Sales Orders" color="text-orange-400" />
                    )}

                    {canAccess(['PURCHASE', 'OWNER']) && (
                      <NavItem to="/dashboard/purchase" icon={<Truck />} label="Procurement" color="text-amber-400" />
                    )}

                    <NavItem to="/dashboard/ledger" icon={<History />} label="Stock Ledger" />

                    {user.role === 'ADMIN' && (
                      <div className="pt-4 mt-4 border-t border-slate-800 space-y-1">
                        <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">System Admin</p>
                        <NavItem to="/dashboard/requests" icon={<Inbox />} label="Access Requests" color="text-orange-400" />
                        <NavItem to="/dashboard/users" icon={<UserPlus />} label="Staff Management" color="text-blue-400" />
                        <NavItem to="/dashboard/audit-logs" icon={<ShieldAlert />} label="Audit Logs" color="text-red-400" />
                        <NavItem to="/dashboard/config" icon={<Settings />} label="Configuration" />
                      </div>
                    )}
                  </nav>

                  <div className="p-4 border-t border-slate-800">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all group font-bold text-sm"
                    >
                      <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                      <span>End Session</span>
                    </button>
                  </div>
                </aside>

                <main className="flex-1 overflow-y-auto p-10 relative bg-[#f1f5f9]">
                   <div className="max-w-6xl mx-auto min-h-full">
                      <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="boms" element={<Boms />} />
                        <Route path="sales" element={<Sales />} />
                        <Route path="purchase" element={<Purchase />} />
                        <Route path="manufacturing" element={<Manufacturing />} />
                        <Route path="ledger" element={<StockLedger />} />
                        <Route path="requests" element={<Requests />} />
                        <Route path="users" element={<Users />} />
                        <Route path="audit-logs" element={<AuditLogs />} />
                        <Route path="config" element={<Config />} />
                      </Routes>
                   </div>
                </main>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

const NavItem = ({ to, icon, label, color = "text-slate-400", end = false }: any) => (
  <Link 
    to={to} 
    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all group"
  >
    {React.cloneElement(icon, { className: `w-5 h-5 ${color} group-hover:scale-110 transition-transform` })}
    <span className="font-bold text-sm">{label}</span>
  </Link>
);

export default App;
