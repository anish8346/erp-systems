
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings, Plus, LayoutGrid, Globe, CreditCard, Layers } from 'lucide-react';
import { Button, Card, Input, Badge } from '../components/UI';
import type { WorkCenter } from '../types';

const Config = () => {
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [newWC, setNewWC] = useState('');

  const fetchWCs = async () => {
    try {
      const res = await api.get('/config/work-centers');
      setWorkCenters(res.data);
    } catch (err) {
      console.error("Failed to fetch work centers", err);
    }
  };

  useEffect(() => {
    fetchWCs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/config/work-centers', { name: newWC });
      setNewWC('');
      fetchWCs();
    } catch (err) {
      console.error("Failed to add work center", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">System Configuration</h2>
          <p className="text-warm-taupe text-sm font-medium">Manage manufacturing work centers and global application settings.</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-soft-cream">
          <Settings className="w-6 h-6 text-luxury-brown animate-spin-slow" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Work Centers Section */}
        <Card title="Work Centers" subtitle="Production stages on the factory floor" className="h-full">
          <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="e.g. Assembly Line A" 
                value={newWC}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWC(e.target.value)}
                required
              />
            </div>
            <div className="pt-6">
              <Button type="submit" className="h-[42px] px-6">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {workCenters.map((wc: WorkCenter) => (
              <div key={wc.id} className="bg-faded-white px-4 py-3 rounded-xl border border-soft-cream flex justify-between items-center group hover:bg-white hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-soft-cream shadow-xs group-hover:border-luxury-brown/30 transition-colors">
                    <Layers className="w-4 h-4 text-luxury-brown" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{wc.name}</span>
                </div>
                <Badge variant="neutral">ID: {wc.id.slice(0,5).toUpperCase()}</Badge>
              </div>
            ))}
            {workCenters.length === 0 && (
              <div className="text-center py-10">
                <p className="text-warm-taupe/60 text-sm font-medium italic">No work centers defined yet.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Global Settings Section */}
        <div className="space-y-6">
          <Card title="Localization" subtitle="Regional and standard formatting" className="relative">
            <div className="space-y-6">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Primary Currency</p>
                    <p className="text-[10px] text-warm-taupe font-medium uppercase tracking-tight">Used for all financial transactions</p>
                  </div>
                </div>
                <select className="bg-faded-white border border-soft-cream rounded-lg px-3 py-1.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-luxury-brown/10 disabled:opacity-60" disabled>
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                </select>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <Globe className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">System Timezone</p>
                    <p className="text-[10px] text-warm-taupe font-medium uppercase tracking-tight">Standardized audit log timestamps</p>
                  </div>
                </div>
                <select className="bg-faded-white border border-soft-cream rounded-lg px-3 py-1.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-luxury-brown/10 disabled:opacity-60" disabled>
                  <option>IST (UTC+5:30)</option>
                  <option>UTC (Global)</option>
                </select>
              </div>
            </div>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center rounded-xl pointer-events-none">
               <span className="bg-gray-900/80 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg">Enterprise Feature Only</span>
            </div>
          </Card>

          <Card title="Layout Engine" subtitle="Visual interface preferences">
            <div className="flex items-center justify-between opacity-50">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                    <LayoutGrid className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Compact View Mode</span>
               </div>
               <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Config;
