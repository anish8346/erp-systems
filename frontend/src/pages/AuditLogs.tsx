import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldAlert } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await api.get('/config/audit-logs');
      setLogs(res.data);
    };
    fetchLogs();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">System Audit Logs</h2>
        <ShieldAlert className="w-6 h-6 text-red-500" />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-700">Timestamp</th>
              <th className="px-6 py-3 font-semibold text-gray-700">User</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Action</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Entity</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 font-medium">{log.user.name}</td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">{log.action}</span>
                </td>
                <td className="px-6 py-4 font-mono">{log.entityType} ({log.entityId.slice(0,8)})</td>
                <td className="px-6 py-4 text-gray-600">{log.details}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                  No system activity logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
