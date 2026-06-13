import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings, Plus } from 'lucide-react';

const Config = () => {
  const [workCenters, setWorkCenters] = useState<any[]>([]);
  const [newWC, setNewWC] = useState('');

  const fetchWCs = async () => {
    const res = await api.get('/config/work-centers');
    setWorkCenters(res.data);
  };

  useEffect(() => {
    fetchWCs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/config/work-centers', { name: newWC });
    setNewWC('');
    fetchWCs();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <Settings className="w-8 h-8 text-gray-600 mr-3" />
        <h2 className="text-2xl font-bold">System Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Work Centers */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Work Centers</h3>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <input 
              placeholder="e.g. Assembly Line" 
              className="flex-1 border p-2 rounded text-sm"
              value={newWC}
              onChange={(e) => setNewWC(e.target.value)}
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Add
            </button>
          </form>
          <ul className="space-y-2">
            {workCenters.map((wc) => (
              <li key={wc.id} className="bg-gray-50 px-4 py-2 rounded text-sm border border-gray-100 flex justify-between">
                {wc.name}
                <span className="text-xs text-gray-400">ID: {wc.id.slice(0,5)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Other Configs */}
        <div className="bg-white p-6 rounded-lg shadow-md opacity-50 pointer-events-none">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Currency</label>
              <select className="w-full border p-2 rounded text-sm bg-gray-50"><option>INR (₹)</option></select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Timezone</label>
              <select className="w-full border p-2 rounded text-sm bg-gray-50"><option>UTC (Global)</option></select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;
