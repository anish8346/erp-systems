import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StockLedger = () => {
  const [ledger, setLedger] = useState<any[]>([]);

  const fetchLedger = async () => {
    // We'll need a backend route for this. I'll add the controller logic too.
    const res = await api.get('/products/ledger');
    setLedger(res.data);
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Stock Ledger</h2>
        <div className="text-sm text-gray-500 flex items-center">
            <History className="w-4 h-4 mr-1" /> Full Traceability
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Product</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Type</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Change</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ledger.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(entry.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-medium">{entry.product.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    entry.type.includes('PURCHASE') || entry.type.includes('PRODUCE') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {entry.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center font-bold">
                     {entry.quantityChange > 0 ? (
                       <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                     ) : (
                       <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                     )}
                     <span className={entry.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}>
                        {entry.quantityChange}
                     </span>
                   </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                  {entry.referenceId.slice(0, 12)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ledger.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No stock movements recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default StockLedger;
