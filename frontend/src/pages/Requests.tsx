import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Inbox, Check, X, Building, Mail, MessageSquare } from 'lucide-react';
import { Button, Card, Badge } from '../components/UI';

const Requests = () => {
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/requests/${id}`, { status });
      fetchRequests();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900">Access Requests</h2>
        <p className="text-gray-500">Review requests from individuals wanting to join the Shiv Furniture portal.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((req) => (
          <Card key={req.id} className={`${req.status === 'PENDING' ? 'border-l-4 border-l-orange-400' : ''}`}>
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                   <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{req.name}</h3>
                      <Badge variant={req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'warning'}>
                         {req.status}
                      </Badge>
                   </div>
                   <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {req.company}</span>
                      <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {req.email}</span>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 border border-gray-100 flex gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                      <p>{req.message}</p>
                   </div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                     Requested on {new Date(req.createdAt).toLocaleString()}
                   </p>
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex flex-row md:flex-col gap-2 shrink-0">
                     <Button size="sm" variant="success" onClick={() => handleStatus(req.id, 'APPROVED')}>
                        <Check className="w-4 h-4" /> Approve
                     </Button>
                     <Button size="sm" variant="danger" onClick={() => handleStatus(req.id, 'REJECTED')}>
                        <X className="w-4 h-4" /> Reject
                     </Button>
                  </div>
                )}
             </div>
          </Card>
        ))}

        {requests.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
             <Inbox className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-400 font-medium">No access requests received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
