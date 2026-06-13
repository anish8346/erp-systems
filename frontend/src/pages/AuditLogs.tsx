
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Search, Filter, Clock, User } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI';
import type { AuditLog } from '../types';

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/config/audit-logs');
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    (log.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">Audit Logs</h2>
          <p className="text-warm-taupe text-sm font-medium">Monitor system activities and maintain security compliance.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-soft-cream flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">System Secured</span>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-lg bg-white/50 backdrop-blur-md">
        <div className="p-4 border-b border-soft-cream bg-white flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-taupe/60" />
            <input 
              placeholder="Search logs by user, action, or details..." 
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
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60">Time & Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60">Action</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60">Entity</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-warm-taupe/60 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-faded-white/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-warm-taupe/60" />
                      <div>
                        <p className="text-sm font-medium text-luxury-brown">{new Date(log.createdAt).toLocaleDateString()}</p>
                        <p className="text-[10px] font-bold text-warm-taupe/60">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center border border-soft-cream">
                        <User className="w-4 h-4 text-warm-taupe" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{log.user?.name || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      log.action.includes('CREATE') || log.action.includes('POST') ? 'success' :
                      log.action.includes('UPDATE') || log.action.includes('PUT') || log.action.includes('PATCH') ? 'warning' :
                      log.action.includes('DELETE') ? 'danger' : 'neutral'
                    }>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-luxury-brown uppercase tracking-tight">{log.entityType}</span>
                      <span className="text-[10px] font-mono text-warm-taupe/60">ID: {log.entityId.slice(0,8).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-xs text-gray-600 font-medium max-w-xs ml-auto line-clamp-1 group-hover:line-clamp-none transition-all">
                      {log.details}
                    </p>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-warm-taupe/60 font-bold text-lg">No audit logs found</p>
                    <p className="text-warm-taupe/60 text-sm mt-1">Every system action will be recorded here for security.</p>
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

export default AuditLogs;
