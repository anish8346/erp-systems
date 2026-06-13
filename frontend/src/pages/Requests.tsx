
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';
import { Inbox, Check, X, Building, Mail, MessageSquare, Clock, ShieldQuestion } from 'lucide-react';
import { Button, Card, Badge } from '../components/UI';
import type { AccessRequest } from '../types';

const Requests = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);

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
    } catch (err: unknown) {
      let errorMsg = "Failed to update status";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      alert(errorMsg);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">Access Requests</h2>
          <p className="text-warm-taupe text-sm font-medium">Review and manage requests from individuals wanting to join the Shiv Furniture portal.</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-soft-cream">
          <ShieldQuestion className="w-6 h-6 text-luxury-brown" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.map((req) => (
          <Card key={req.id} className={`hover:shadow-md transition-all border-l-4 ${
            req.status === 'PENDING' ? 'border-l-amber-500 bg-amber-50/5' : 
            req.status === 'APPROVED' ? 'border-l-emerald-500' : 
            'border-l-rose-500'
          }`}>
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4 flex-1">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-faded-white rounded-full flex items-center justify-center border border-soft-cream text-warm-taupe/60">
                        {req.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-luxury-brown">{req.name}</h3>
                          <Badge variant={req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'warning'}>
                            {req.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1">
                          <span className="flex items-center gap-1.5 text-xs text-warm-taupe font-medium">
                            <Building className="w-3.5 h-3.5 text-warm-taupe/60" /> {req.company}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-warm-taupe font-medium">
                            <Mail className="w-3.5 h-3.5 text-warm-taupe/60" /> {req.email}
                          </span>
                        </div>
                      </div>
                   </div>

                   <div className="bg-white p-4 rounded-2xl text-sm text-gray-600 border border-soft-cream flex gap-3 shadow-sm relative">
                      <div className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-bold text-warm-taupe/60 uppercase tracking-widest border border-soft-cream rounded-full">Message</div>
                      <MessageSquare className="w-4 h-4 mt-0.5 text-luxury-brown shrink-0" />
                      <p className="leading-relaxed italic">"{req.message}"</p>
                   </div>
                   
                   <div className="flex items-center gap-1.5 text-[10px] text-warm-taupe/60 font-bold uppercase tracking-tight ml-1">
                     <Clock className="w-3 h-3" /> Requested on {new Date(req.createdAt).toLocaleString()}
                   </div>
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex flex-row lg:flex-col gap-3 shrink-0">
                     <Button variant="success" className="font-bold px-6 shadow-sm shadow-emerald-100" onClick={() => handleStatus(req.id, 'APPROVED')}>
                        <Check className="w-4 h-4" /> Approve
                     </Button>
                     <Button variant="danger" className="font-bold px-6 shadow-sm shadow-rose-100" onClick={() => handleStatus(req.id, 'REJECTED')}>
                        <X className="w-4 h-4" /> Reject
                     </Button>
                  </div>
                )}
             </div>
          </Card>
        ))}

        {requests.length === 0 && (
          <div className="text-center py-20 bg-faded-white rounded-2xl border-2 border-dashed border-soft-cream">
             <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <p className="text-warm-taupe font-bold text-lg">No access requests found</p>
             <p className="text-warm-taupe/60 text-sm mt-1">When someone requests to join the portal, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
