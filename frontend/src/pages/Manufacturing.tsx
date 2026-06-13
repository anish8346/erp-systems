
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Factory, CheckCircle2, Activity, Clock, Box, Plus, Search, ArrowLeft, User as UserIcon, ListTree, Package, Timer, XCircle, ChevronRight } from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/UI';
import type { ManufacturingOrder, Product, BoM, WorkOrder, User, MOComponent } from '../types';
import axios from 'axios';

const Manufacturing = () => {
  const [mos, setMos] = useState<ManufacturingOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [boms, setBoms] = useState<BoM[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [currentMO, setCurrentMO] = useState<ManufacturingOrder | null>(null);

  const [newMO, setNewMO] = useState({
    productId: '',
    quantity: 1,
    bomId: '',
    assigneeId: '',
  });

  const fetchData = async () => {
    try {
      const [mosRes, productsRes, bomsRes, usersRes] = await Promise.all([
        api.get('/manufacturing'),
        api.get('/products'),
        api.get('/boms'),
        api.get('/config/users'),
      ]);
      setMos(mosRes.data);
      setProducts(productsRes.data);
      setBoms(bomsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Fetch manufacturing data failed", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/manufacturing', newMO);
      setShowForm(false);
      setNewMO({ productId: '', quantity: 1, bomId: '', assigneeId: '' });
      fetchData();
    } catch (err: unknown) {
      let errorMsg = "Failed to create manufacturing order";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      alert(errorMsg);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.post(`/manufacturing/${id}/confirm`);
      fetchData();
      refreshCurrentMO(id);
    } catch (err: unknown) {
      let errorMsg = "Confirmation failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      alert(errorMsg);
    }
  };

  const handleProduce = async (id: string) => {
    try {
      await api.post(`/manufacturing/${id}/produce`);
      fetchData();
      refreshCurrentMO(id);
    } catch (err: unknown) {
      let errorMsg = "Production failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      alert(errorMsg);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this production order?")) return;
    try {
      await api.post(`/manufacturing/${id}/cancel`);
      fetchData();
      refreshCurrentMO(id);
    } catch (err: unknown) {
      let errorMsg = "Cancellation failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      alert(errorMsg);
    }
  };

  const refreshCurrentMO = async (id: string) => {
    const res = await api.get('/manufacturing');
    const updated = res.data.find((m: ManufacturingOrder) => m.id === id);
    if (updated) setCurrentMO(updated);
  };

  const updateWOStatus = async (woId: string, status: string) => {
    try {
      await api.patch(`/manufacturing/work-order/${woId}/status`, { status });
      if (currentMO) refreshCurrentMO(currentMO.id);
      fetchData();
    } catch (err: unknown) {
      alert("Failed to update work order status");
    }
  };

  const updateWODuration = async (woId: string, duration: number) => {
    try {
      await api.patch(`/manufacturing/work-order/${woId}/duration`, { realDuration: duration });
      if (currentMO) refreshCurrentMO(currentMO.id);
      fetchData();
    } catch (err: unknown) {
      alert("Failed to update duration");
    }
  };

  const updateConsumedQty = async (compId: string, consumed: number) => {
    try {
      await api.patch(`/manufacturing/component/${compId}/consumed`, { consumed });
      if (currentMO) refreshCurrentMO(currentMO.id);
      fetchData();
    } catch (err: unknown) {
      alert("Failed to update consumed quantity");
    }
  };

  const filteredMOs = mos.filter(mo => 
    (mo.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    mo.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDetail = (mo: ManufacturingOrder) => {
    setCurrentMO(mo);
    setView('detail');
  };

  if (view === 'detail' && currentMO) {
    const isReadOnly = currentMO.status === 'DONE' || currentMO.status === 'CANCELLED';
    const isDraft = currentMO.status === 'DRAFT';
    const isConfirmed = currentMO.status === 'CONFIRMED' || currentMO.status === 'IN_PROGRESS';

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <Button variant="secondary" onClick={() => setView('list')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to list
          </Button>
          <div className="flex gap-3">
             {isDraft && (
               <>
                 <Button variant="danger" onClick={() => handleCancel(currentMO.id)}>
                   <XCircle className="w-4 h-4 mr-2" /> Cancel MO
                 </Button>
                 <Button onClick={() => handleConfirm(currentMO.id)}>
                   <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm MO
                 </Button>
               </>
             )}
             {isConfirmed && (
               <>
                 <Button variant="danger" onClick={() => handleCancel(currentMO.id)}>
                   <XCircle className="w-4 h-4 mr-2" /> Cancel MO
                 </Button>
                 <Button variant="success" onClick={() => handleProduce(currentMO.id)}>
                   <Factory className="w-4 h-4 mr-2" /> Produce
                 </Button>
               </>
             )}
          </div>
        </div>

        <Card title={`Manufacturing Order ${currentMO.id.slice(0,8).toUpperCase()}`} subtitle={`Status: ${currentMO.status}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Finished Product</label>
                <p className="text-lg font-bold text-luxury-brown">{currentMO.product?.name}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Quantity to Produce</label>
                <p className="text-sm font-bold text-luxury-brown">{currentMO.quantity} units</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Assignee</label>
                <p className="text-sm font-medium text-luxury-brown">{currentMO.assignee?.name || 'Unassigned'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Bill of Materials</label>
                <p className="text-sm font-medium text-luxury-brown">{currentMO.bom?.name || 'Standard'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Planned Date</label>
                <p className="text-sm font-medium text-luxury-brown">{new Date(currentMO.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Components Section */}
          <div className="mt-10">
            <h4 className="font-bold text-luxury-brown mb-4 border-b pb-2 flex items-center gap-2">
              <Package className="w-4 h-4" /> Components / Materials
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-bold text-warm-taupe uppercase tracking-widest border-b">
                    <th className="pb-3">Product</th>
                    <th className="pb-3 text-center">To Consume</th>
                    <th className="pb-3 text-center">Consumed</th>
                    <th className="pb-3 text-center">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentMO.components?.map((comp: MOComponent) => {
                    const freeToUse = (comp.product?.qtyOnHand || 0) - (comp.product?.qtyReserved || 0);
                    const isAvailable = freeToUse >= comp.toConsume;
                    return (
                      <tr key={comp.id}>
                        <td className="py-3 font-semibold text-luxury-brown">{comp.product?.name}</td>
                        <td className="py-3 text-center font-bold">{comp.toConsume}</td>
                        <td className="py-3 text-center">
                          {isConfirmed ? (
                            <input 
                              type="number"
                              className="w-20 px-2 py-1 border rounded text-center font-bold"
                              defaultValue={comp.consumed}
                              onBlur={(e) => updateConsumedQty(comp.id, Number(e.target.value))}
                              disabled={isReadOnly}
                            />
                          ) : (
                            <span className="text-gray-400 italic">Hidden until confirmed</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {isAvailable ? (
                            <Badge variant="success">Available</Badge>
                          ) : (
                            <Badge variant="warning">Shortage</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Work Orders Section */}
          <div className="mt-10">
            <h4 className="font-bold text-luxury-brown mb-4 border-b pb-2 flex items-center gap-2">
              <ListTree className="w-4 h-4" /> Work Orders / Production Steps
            </h4>
            <div className="space-y-4">
               {currentMO.WorkOrders?.map((wo: WorkOrder, idx: number) => (
                 <div key={wo.id} className={`p-4 rounded-xl border ${wo.status === 'DONE' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-faded-white border-soft-cream'}`}>
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${wo.status === 'DONE' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-luxury-brown'}`}>
                             <Timer className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="font-bold text-luxury-brown">{wo.operation?.name || wo.operationName}</p>
                             <p className="text-[10px] font-bold text-warm-taupe uppercase">{wo.workCenter?.name || 'General Assembly'}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <Badge variant={wo.status === 'DONE' ? 'success' : wo.status === 'IN_PROGRESS' ? 'purple' : 'neutral'}>
                             {wo.status}
                          </Badge>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-soft-cream/50">
                       <div>
                          <label className="text-[9px] font-bold text-warm-taupe uppercase block">Expected</label>
                          <span className="text-sm font-bold text-luxury-brown">{wo.expectedDuration} mins</span>
                       </div>
                       <div>
                          <label className="text-[9px] font-bold text-warm-taupe uppercase block">Real Duration</label>
                          {isConfirmed ? (
                            <input 
                              type="number"
                              className="w-20 px-2 py-0.5 border rounded text-xs font-bold"
                              defaultValue={wo.realDuration}
                              onBlur={(e) => updateWODuration(wo.id, Number(e.target.value))}
                              disabled={isReadOnly}
                            />
                          ) : (
                            <span className="text-sm text-gray-400">---</span>
                          )}
                       </div>
                       <div className="md:col-span-2 flex justify-end gap-2">
                          {wo.status === 'PENDING' && !isReadOnly && (
                            <Button size="sm" variant="secondary" onClick={() => updateWOStatus(wo.id, 'IN_PROGRESS')}>Start Step</Button>
                          )}
                          {wo.status === 'IN_PROGRESS' && (
                            <Button size="sm" onClick={() => updateWOStatus(wo.id, 'DONE')}>Finish Step</Button>
                          )}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">Manufacturing Orders</h2>
          <p className="text-warm-taupe text-sm font-medium">Manage production orders and shop floor operations.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="font-semibold">
          <Plus className="w-5 h-5" /> Plan Production
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-soft-cream">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-taupe/60" />
          <input 
            placeholder="Search by product or order ID..." 
            className="w-full pl-10 pr-4 py-2 bg-faded-white border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-brown/20 outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMOs.map((mo) => (
          <Card key={mo.id} className={`hover:shadow-md transition-all border-l-4 ${mo.status === 'DONE' ? 'border-l-emerald-500' : mo.status === 'CANCELLED' ? 'border-l-gray-300 opacity-75' : 'border-l-indigo-500'} cursor-pointer`} onClick={() => openDetail(mo)}>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${mo.status === 'DONE' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Factory className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-luxury-brown text-lg">{mo.product?.name}</h3>
                      <Badge variant={mo.status === 'DONE' ? 'success' : mo.status === 'CANCELLED' ? 'neutral' : 'purple'}>
                        {mo.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-warm-taupe font-medium">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-[10px]">MO-{mo.id.slice(0,8).toUpperCase()}</span>
                      <span className="flex items-center gap-1"><Box className="w-3.5 h-3.5" /> Qty: {mo.quantity}</span>
                      {mo.assignee && <span className="flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" /> {mo.assignee.name}</span>}
                    </div>
                  </div>
               </div>
               <ChevronRight className="text-warm-taupe/40" />
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Manufacturing Order">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Finished Good *</label>
              <select 
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm"
                value={newMO.productId}
                onChange={(e) => {
                  const prod = products.find(p => p.id === e.target.value);
                  setNewMO({...newMO, productId: e.target.value, bomId: prod?.bomId || ''});
                }}
                required
              >
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <Input 
              label="Quantity to Produce *" 
              type="number"
              min="1"
              value={newMO.quantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMO({...newMO, quantity: Number(e.target.value)})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Bill of Materials *</label>
              <select 
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm"
                value={newMO.bomId}
                onChange={(e) => setNewMO({...newMO, bomId: e.target.value})}
                required
              >
                <option value="">Select BoM...</option>
                {boms.filter(b => !newMO.productId || b.productId === newMO.productId).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Assignee</label>
              <select 
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm"
                value={newMO.assigneeId}
                onChange={(e) => setNewMO({...newMO, assigneeId: e.target.value})}
              >
                <option value="">Select Assignee...</option>
                {users.filter(u => u.role === 'MFG' || u.role === 'ADMIN').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">Create Draft Order</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Manufacturing;
