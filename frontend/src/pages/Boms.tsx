
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, ListTree, Timer, Package, ChevronRight } from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/UI';
import type { BoM, Product, WorkCenter, BoMLine, Operation } from '../types';
import axios from 'axios';

const Boms = () => {
  const [boms, setBoms] = useState<BoM[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newBom, setNewBom] = useState({
    productId: '',
    name: '',
    components: [{ componentId: '', quantity: 1 }],
    operations: [{ name: '', workCenterId: '', duration: 30 }]
  });

  const fetchData = async () => {
    try {
      const [bomsRes, prodRes, wcRes] = await Promise.all([
        api.get('/boms').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] })),
        api.get('/config/work-centers').catch(() => ({ data: [] }))
      ]);
      setBoms(bomsRes.data);
      setProducts(prodRes.data);
      setWorkCenters(wcRes.data);
    } catch (err) {
      console.error("Critical fetch error in Bill of Materials page", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addComponent = () => {
    setNewBom({
      ...newBom,
      components: [...newBom.components, { componentId: '', quantity: 1 }]
    });
  };

  const addOperation = () => {
    setNewBom({
      ...newBom,
      operations: [...newBom.operations, { name: '', workCenterId: '', duration: 30 }]
    });
  };

  const removeComponent = (index: number) => {
    const updated = newBom.components.filter((_, i) => i !== index);
    setNewBom({ ...newBom, components: updated });
  };

  const removeOperation = (index: number) => {
    const updated = newBom.operations.filter((_, i) => i !== index);
    setNewBom({ ...newBom, operations: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/boms', newBom);
      setShowModal(false);
      setNewBom({
        productId: '',
        name: '',
        components: [{ componentId: '', quantity: 1 }],
        operations: [{ name: '', workCenterId: '', duration: 30 }]
      });
      fetchData();
    } catch (err: unknown) {
      let errorMsg = "Failed to save Bill of Materials";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      alert(errorMsg);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">Bill of Materials</h2>
          <p className="text-warm-taupe text-sm font-medium">Define product recipes and production steps for manufacturing.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="font-semibold">
          <Plus className="w-5 h-5" /> Create New BoM
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {boms.map((bom) => (
          <Card key={bom.id} className="hover:shadow-md transition-all border-l-4 border-l-luxury-brown">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-luxury-brown">{bom.product?.name}</h3>
                <p className="text-sm text-warm-taupe font-medium">{bom.name}</p>
              </div>
              <Badge variant="neutral">REF-{bom.id.slice(0,5).toUpperCase()}</Badge>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-bold uppercase text-warm-taupe/60 mb-3 tracking-wider flex items-center gap-2">
                  <Package className="w-3 h-3" /> Material Requirements
                </p>
                <div className="space-y-2">
                  {bom.bomLines.map((line: BoMLine) => (
                    <div key={line.id} className="flex justify-between text-sm bg-faded-white px-3 py-2 rounded-xl border border-soft-cream">
                      <span className="text-gray-700 font-semibold">{line.component?.name}</span>
                      <span className="font-bold text-luxury-brown">x{line.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase text-warm-taupe/60 mb-3 tracking-wider flex items-center gap-2">
                  <ListTree className="w-3 h-3" /> Production Steps
                </p>
                <div className="space-y-2">
                  {bom.operations?.map((op: Operation) => (
                    <div key={op.id} className="flex items-center gap-3 bg-faded-white p-3 rounded-xl border border-soft-cream">
                      <div className="p-2 bg-white rounded-lg border border-soft-cream">
                        <Timer className="w-4 h-4 text-luxury-brown" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-luxury-brown leading-tight">{op.name}</p>
                        <p className="text-[10px] font-semibold text-warm-taupe uppercase">{op.workCenter?.name || 'Manual Operation'}</p>
                      </div>
                      <span className="text-xs font-bold text-luxury-brown">{op.duration}m</span>
                    </div>
                  ))}
                  {(!bom.operations || bom.operations.length === 0) && (
                    <p className="text-xs text-warm-taupe/60 italic font-medium">No production steps defined.</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {boms.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="bg-faded-white rounded-2xl p-12 inline-block border-2 border-dashed border-soft-cream">
              <ListTree className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-warm-taupe font-medium text-lg">No Bill of Materials found</p>
              <p className="text-warm-taupe/60 text-sm mt-1">Start by creating your first product recipe.</p>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Bill of Materials">
        <form onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Finished Product</label>
              <select 
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm"
                value={newBom.productId}
                onChange={(e) => setNewBom({...newBom, productId: e.target.value})}
                required
              >
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <Input 
              label="BoM Name / Version" 
              placeholder="e.g. Standard 2024 Design" 
              value={newBom.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBom({...newBom, name: e.target.value})}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 border-b border-soft-cream pb-2">
              <h4 className="font-bold text-luxury-brown text-xs uppercase tracking-wider">Components</h4>
              <button type="button" onClick={addComponent} className="text-luxury-brown text-xs font-bold hover:underline">
                + Add Component
              </button>
            </div>
            <div className="space-y-3">
              {newBom.components.map((comp, idx) => (
                <div key={idx} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <select 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-luxury-brown"
                      value={comp.componentId}
                      onChange={(e) => {
                        const updated = [...newBom.components];
                        updated[idx].componentId = e.target.value;
                        setNewBom({...newBom, components: updated});
                      }}
                      required
                    >
                      <option value="">Select Component</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input 
                      type="number" 
                      placeholder="Qty" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-luxury-brown"
                      value={comp.quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const updated = [...newBom.components];
                        updated[idx].quantity = Number(e.target.value);
                        setNewBom({...newBom, components: updated});
                      }}
                      required
                    />
                  </div>
                  <button type="button" onClick={() => removeComponent(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 border-b border-soft-cream pb-2">
              <h4 className="font-bold text-luxury-brown text-xs uppercase tracking-wider">Production Operations</h4>
              <button type="button" onClick={addOperation} className="text-luxury-brown text-xs font-bold hover:underline">
                + Add Operation
              </button>
            </div>
            <div className="space-y-4">
              {newBom.operations.map((op, idx) => (
                <div key={idx} className="p-4 bg-faded-white rounded-xl border border-soft-cream relative">
                  <button 
                    type="button" 
                    onClick={() => removeOperation(idx)} 
                    className="absolute top-2 right-2 p-1.5 text-warm-taupe/60 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-warm-taupe uppercase ml-1">Process Name</label>
                      <input 
                        placeholder="e.g. Surface Sanding" 
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-luxury-brown bg-white"
                        value={op.name}
                        onChange={(e) => {
                          const updated = [...newBom.operations];
                          updated[idx].name = e.target.value;
                          setNewBom({...newBom, operations: updated});
                        }}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-warm-taupe uppercase ml-1">Work Center</label>
                        <select 
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-luxury-brown bg-white"
                          value={op.workCenterId}
                          onChange={(e) => {
                            const updated = [...newBom.operations];
                            updated[idx].workCenterId = e.target.value;
                            setNewBom({...newBom, operations: updated});
                          }}
                          required
                        >
                          <option value="">Select WC...</option>
                          {workCenters.map(wc => (
                            <option key={wc.id} value={wc.id}>{wc.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-warm-taupe uppercase ml-1">Mins</label>
                        <input 
                          type="number" 
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-luxury-brown bg-white"
                          value={op.duration}
                          onChange={(e) => {
                            const updated = [...newBom.operations];
                            updated[idx].duration = Number(e.target.value);
                            setNewBom({...newBom, operations: updated});
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Finalize BoM</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Boms;
