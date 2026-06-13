
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';
import { 
  Plus, Download, Truck, ShoppingCart, Package, Search, Clock, 
  ArrowLeft, CheckCircle, XCircle, User as UserIcon, MapPin, Trash2, 
  MessageSquare, Edit3, Save, TrendingDown, History 
} from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/UI';
import type { PurchaseOrder, Product, Vendor, PurchaseOrderLine, User, PurchaseOrderComment } from '../types';

const Purchase = () => {
  const [view, setView] = useState<'list' | 'form' | 'negotiation'>('list');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [receiveQtys, setReceiveQtys] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Negotiation states
  const [negotiationOrder, setNegotiationOrder] = useState<PurchaseOrder | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editingPriceLineId, setEditingPriceLineId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const [newOrder, setNewOrder] = useState({
    vendorId: '',
    vendorAddress: '',
    responsiblePersonId: '',
    orderLines: [{ productId: '', quantity: 1, price: 0 }]
  });

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes, vendorsRes, usersRes] = await Promise.all([
        api.get('/purchase'),
        api.get('/products'),
        api.get('/vendors'),
        api.get('/users'),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setVendors(vendorsRes.data);
      setUsers(usersRes.data);
      
      // Update negotiation order if it exists
      if (negotiationOrder) {
          const updated = (ordersRes.data as PurchaseOrder[]).find(o => o.id === negotiationOrder.id);
          if (updated) setNegotiationOrder(updated);
      }
    } catch (err) {
      console.error("Fetch data failed", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVendorChange = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    setNewOrder({
      ...newOrder,
      vendorId,
      vendorAddress: vendor?.address || ''
    });
  };

  const addOrderLine = () => {
    setNewOrder({
      ...newOrder,
      orderLines: [...newOrder.orderLines, { productId: '', quantity: 1, price: 0 }]
    });
  };

  const removeOrderLine = (index: number) => {
    const lines = [...newOrder.orderLines];
    lines.splice(index, 1);
    setNewOrder({ ...newOrder, orderLines: lines });
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const lines = [...newOrder.orderLines];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      lines[index] = { ...lines[index], productId: value, price: product?.costPrice || 0 };
    } else {
      lines[index] = { ...lines[index], [field]: value };
    }
    setNewOrder({ ...newOrder, orderLines: lines });
  };

  const handleSubmit = async (e: React.FormEvent, startNegotiation: boolean = false) => {
    e.preventDefault();
    try {
      const vendor = vendors.find(v => v.id === newOrder.vendorId);
      
      const response = await api.post('/purchase', {
        ...newOrder,
        vendorName: vendor?.name || 'Unknown',
      });

      const createdOrder = response.data;

      if (startNegotiation) {
          const negotiateRes = await api.post(`/purchase/${createdOrder.id}/negotiate`);
          setNegotiationOrder(negotiateRes.data);
          setView('negotiation');
      } else {
          setView('list');
      }

      setNewOrder({
        vendorId: '',
        vendorAddress: '',
        responsiblePersonId: '',
        orderLines: [{ productId: '', quantity: 1, price: 0 }]
      });
      fetchData();
    } catch (err: unknown) {
      let errorMsg = "Failed to create procurement order";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      alert(errorMsg);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.post(`/purchase/${id}/confirm`);
      if (view === 'negotiation') {
          setView('list');
          setNegotiationOrder(null);
      }
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to confirm order");
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.post(`/purchase/${id}/cancel`);
      if (view === 'negotiation') {
          setView('list');
          setNegotiationOrder(null);
      }
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to cancel order");
    }
  };

  // Negotiation Actions
  const handleStartNegotiation = async (id: string) => {
      try {
          const response = await api.post(`/purchase/${id}/negotiate`);
          const updatedOrder = response.data;
          // Set negotiation order first
          setNegotiationOrder(updatedOrder);
          // Small timeout to ensure state is processed if needed, though usually not necessary with React 18+ batching
          // but changing the order helps.
          setView('negotiation');
          fetchData(); // Refresh list in background
      } catch (err: any) {
          alert(err.response?.data?.error || "Failed to start negotiation");
      }
  };

  const handleAddComment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!negotiationOrder || !newComment.trim()) return;
      try {
          const response = await api.post(`/purchase/${negotiationOrder.id}/comment`, { text: newComment });
          setNegotiationOrder(response.data);
          setNewComment('');
          fetchData();
      } catch (err: any) {
          alert(err.response?.data?.error || "Failed to add comment");
      }
  };

  const handleUpdatePrice = async (lineId: string) => {
      if (!negotiationOrder) return;
      try {
          const response = await api.patch(`/purchase/${negotiationOrder.id}/line/${lineId}`, { price: tempPrice });
          setNegotiationOrder(response.data);
          setEditingPriceLineId(null);
          fetchData();
      } catch (err: any) {
          alert(err.response?.data?.error || "Failed to update price");
      }
  };

  const openReceiveModal = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    const initialQtys: Record<string, number> = {};
    order.orderLines.forEach(line => {
      initialQtys[line.id] = line.quantity - (line.receivedQty || 0);
    });
    setReceiveQtys(initialQtys);
    setShowReceiveModal(true);
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const items = Object.keys(receiveQtys).map(lineId => ({
      lineId,
      quantity: Number(receiveQtys[lineId])
    })).filter(i => i.quantity > 0);

    try {
      await api.post(`/purchase/${selectedOrder.id}/receive`, { items });
      setShowReceiveModal(false);
      fetchData();
    } catch (err: unknown) {
      let errorMsg = "Receipt failed";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      alert(errorMsg);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotal = (lines: any[]) => {
      return lines.reduce((acc, line) => acc + (line.quantity * line.price), 0);
  };

  if (view === 'form') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="p-2 hover:bg-soft-cream rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-luxury-brown" />
          </button>
          <h2 className="text-3xl font-bold text-luxury-brown">Create Purchase Order</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 ml-1">Vendor</label>
                  <select 
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm"
                    value={newOrder.vendorId}
                    onChange={(e) => handleVendorChange(e.target.value)}
                    required
                  >
                    <option value="">Select a vendor...</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <Input 
                  label="Vendor Address"
                  value={newOrder.vendorAddress}
                  onChange={(e) => setNewOrder({...newOrder, vendorAddress: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 ml-1">Responsible Person</label>
                  <select 
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm"
                    value={newOrder.responsiblePersonId}
                    onChange={(e) => setNewOrder({...newOrder, responsiblePersonId: e.target.value})}
                    required
                  >
                    <option value="">Select a person...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 ml-1">Creation Date</label>
                  <input 
                    type="text" 
                    readOnly 
                    className="px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium text-gray-500 cursor-not-allowed"
                    value={new Date().toLocaleString()}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-luxury-brown">Products</h3>
              <Button type="button" variant="secondary" onClick={addOrderLine} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Line
              </Button>
            </div>
            <div className="space-y-4">
              {newOrder.orderLines.map((line, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 items-end pb-4 border-b border-soft-cream last:border-0">
                  <div className="flex-1 space-y-1.5 min-w-[200px]">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Product</label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                      value={line.productId}
                      onChange={(e) => handleLineChange(index, 'productId', e.target.value)}
                      required
                    >
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Quantity</label>
                    <input 
                      type="number"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      value={line.quantity}
                      onChange={(e) => handleLineChange(index, 'quantity', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="w-32 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Unit Price</label>
                    <input 
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white font-semibold"
                      value={line.price}
                      onChange={(e) => handleLineChange(index, 'price', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="w-32 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Subtotal</label>
                    <div className="w-full px-4 py-2 bg-faded-white rounded-lg text-sm font-bold text-luxury-brown">
                      ₹{(line.quantity * line.price).toLocaleString()}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeOrderLine(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
                <div className="bg-luxury-brown text-white px-6 py-3 rounded-xl">
                    <span className="text-sm opacity-80 font-medium mr-4">Total Amount:</span>
                    <span className="text-xl font-bold">₹{calculateTotal(newOrder.orderLines).toLocaleString()}</span>
                </div>
            </div>
          </Card>

          <div className="flex justify-between items-center pt-4">
            <p className="text-xs text-warm-taupe font-medium italic">
              * Unit prices are fixed during creation and can be negotiated in the "Bargaining" stage.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" type="button" onClick={() => setView('list')}>Cancel</Button>
              <Button 
                type="button" 
                variant="orange" 
                onClick={(e) => handleSubmit(e as any, true)}
              >
                <TrendingDown className="w-4 h-4 mr-1" /> Create & Start Bargaining
              </Button>
              <Button type="submit" variant="primary">Create Draft PO</Button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'negotiation' && negotiationOrder) {
      return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('list')} className="p-2 hover:bg-soft-cream rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-luxury-brown" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-luxury-brown">Negotiate Order</h2>
                        <p className="text-warm-taupe text-sm font-medium">Bargaining for PUR-{negotiationOrder.id.slice(0,8).toUpperCase()} with {negotiationOrder.vendorName}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => handleCancel(negotiationOrder.id)}>Cancel Order</Button>
                    <Button variant="primary" onClick={() => { handleConfirm(negotiationOrder.id); setView('list'); }}>Confirm & Close</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                      <Card className="p-6">
                          <h3 className="font-bold text-luxury-brown mb-4 flex items-center gap-2">
                              <Package className="w-5 h-5" /> Product Pricing
                          </h3>
                          <div className="space-y-4">
                              {negotiationOrder.orderLines.map((line) => (
                                  <div key={line.id} className="flex flex-col md:flex-row items-center gap-4 p-4 bg-faded-white rounded-xl border border-soft-cream">
                                      <div className="flex-1">
                                          <p className="font-bold text-gray-800">{line.product?.name}</p>
                                          <p className="text-xs text-warm-taupe font-medium">Qty: {line.quantity}</p>
                                      </div>
                                      
                                      <div className="flex items-center gap-6">
                                          <div className="text-right">
                                              <p className="text-[10px] font-bold text-gray-500 uppercase">Initial Cost</p>
                                              <p className="text-sm font-bold text-gray-400 line-through">₹{line.initialPrice.toLocaleString()}</p>
                                          </div>
                                          
                                          <div className="w-32">
                                              <p className="text-[10px] font-bold text-luxury-brown uppercase mb-1">Negotiated Price</p>
                                              {editingPriceLineId === line.id ? (
                                                  <div className="flex gap-1 animate-in zoom-in-95 duration-150">
                                                      <input 
                                                        type="number"
                                                        className="w-full px-2 py-1 border-2 border-orange-500 rounded text-sm font-bold focus:ring-0 outline-none"
                                                        value={tempPrice}
                                                        onChange={(e) => setTempPrice(Number(e.target.value))}
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleUpdatePrice(line.id);
                                                            if (e.key === 'Escape') setEditingPriceLineId(null);
                                                        }}
                                                      />
                                                      <button 
                                                        onClick={() => handleUpdatePrice(line.id)} 
                                                        className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors shadow-sm"
                                                        title="Save Price"
                                                      >
                                                          <Save className="w-4 h-4" />
                                                      </button>
                                                      <button 
                                                        onClick={() => setEditingPriceLineId(null)} 
                                                        className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                                                        title="Cancel"
                                                      >
                                                          <XCircle className="w-4 h-4" />
                                                      </button>
                                                  </div>
                                              ) : (
                                                  <div 
                                                    className="flex items-center justify-between px-3 py-1.5 bg-white border border-soft-cream rounded-lg cursor-pointer hover:border-orange-500 group transition-all"
                                                    onClick={() => { setEditingPriceLineId(line.id); setTempPrice(line.price); }}
                                                  >
                                                      <span className="text-sm font-bold text-luxury-brown">₹{line.price.toLocaleString()}</span>
                                                      <Edit3 className="w-3 h-3 text-warm-taupe group-hover:text-orange-500" />
                                                  </div>
                                              )}
                                          </div>

                                          <div className="text-right min-w-[80px]">
                                              <p className="text-[10px] font-bold text-emerald-600 uppercase">Savings</p>
                                              <p className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1">
                                                  <TrendingDown className="w-3 h-3" />
                                                  ₹{((line.initialPrice - line.price) * line.quantity).toLocaleString()}
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          
                          <div className="mt-6 pt-6 border-t flex justify-between items-center">
                              <div>
                                  <p className="text-xs text-warm-taupe font-bold uppercase">Current Total</p>
                                  <p className="text-2xl font-black text-luxury-brown">₹{negotiationOrder.totalAmount.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-xs text-emerald-600 font-bold uppercase">Total Potential Savings</p>
                                  <p className="text-lg font-bold text-emerald-600">
                                      -₹{negotiationOrder.orderLines.reduce((acc, l) => acc + (l.initialPrice - l.price) * l.quantity, 0).toLocaleString()}
                                  </p>
                              </div>
                          </div>
                      </Card>
                  </div>

                  <div className="space-y-6">
                      <Card className="p-6 h-full flex flex-col">
                          <h3 className="font-bold text-luxury-brown mb-4 flex items-center gap-2">
                              <MessageSquare className="w-5 h-5" /> Negotiation Log
                          </h3>
                          
                          <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[400px] pr-2 custom-scrollbar">
                              {negotiationOrder.comments?.map((comment: PurchaseOrderComment) => (
                                  <div key={comment.id} className="bg-faded-white p-3 rounded-xl border border-soft-cream">
                                      <div className="flex justify-between items-center mb-1">
                                          <span className="text-[10px] font-bold text-luxury-brown">{comment.user?.name}</span>
                                          <span className="text-[10px] text-warm-taupe">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                      <p className="text-xs text-gray-700 leading-relaxed font-medium">{comment.text}</p>
                                  </div>
                              ))}
                              {(!negotiationOrder.comments || negotiationOrder.comments.length === 0) && (
                                  <div className="text-center py-10">
                                      <History className="w-8 h-8 text-soft-cream mx-auto mb-2" />
                                      <p className="text-[10px] text-warm-taupe font-bold uppercase">No comments yet</p>
                                  </div>
                              )}
                          </div>

                          <form onSubmit={handleAddComment} className="mt-auto pt-4 border-t border-soft-cream">
                              <textarea 
                                className="w-full px-4 py-2 text-sm border border-soft-cream rounded-xl focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-faded-white resize-none h-24 font-medium"
                                placeholder="Add a note about the negotiation..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                required
                              />
                              <Button type="submit" className="w-full mt-2" size="sm">
                                  Send Comment
                              </Button>
                          </form>
                      </Card>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">Purchase Orders</h2>
          <p className="text-warm-taupe text-sm font-medium">Manage vendor purchases and stock replenishment.</p>
        </div>
        <Button onClick={() => setView('form')} className="font-semibold">
          <Plus className="w-5 h-5" /> New Purchase Order
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-soft-cream">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-taupe/60" />
          <input 
            placeholder="Search by vendor or order ID..." 
            className="w-full pl-10 pr-4 py-2 bg-faded-white border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-brown/20 outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map((o) => (
          <Card key={o.id} className={`hover:shadow-md transition-all border-l-4 ${
              o.status === 'FULLY_RECEIVED' ? 'border-l-emerald-500' :
              o.status === 'CANCELLED' ? 'border-l-red-500' :
              o.status === 'CONFIRMED' ? 'border-l-indigo-500' :
              o.status === 'NEGOTIATION' ? 'border-l-orange-500' :
              'border-l-luxury-brown'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${
                  o.status === 'FULLY_RECEIVED' ? 'bg-emerald-50 text-emerald-600' : 
                  o.status === 'PARTIALLY_RECEIVED' ? 'bg-amber-50 text-amber-600' : 
                  o.status === 'NEGOTIATION' ? 'bg-orange-50 text-orange-600' :
                  o.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                  'bg-indigo-50 text-indigo-600'
                }`}>
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-luxury-brown text-lg">{o.vendorName}</h3>
                    <Badge variant={
                      o.status === 'FULLY_RECEIVED' ? 'success' : 
                      o.status === 'PARTIALLY_RECEIVED' ? 'warning' : 
                      o.status === 'NEGOTIATION' ? 'orange' :
                      o.status === 'CANCELLED' ? 'danger' :
                      'purple'
                    }>
                      {o.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-warm-taupe font-medium">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-[10px] text-gray-600">PUR-{o.id.slice(0,8).toUpperCase()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(o.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" /> {o.responsiblePerson?.name || 'Unassigned'}</span>
                    {o.vendorAddress && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {o.vendorAddress}</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <p className="text-2xl font-bold text-luxury-brown">₹{o.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <div className="flex gap-2">
                    {o.status === 'DRAFT' && (
                        <>
                            <Button variant="secondary" onClick={() => handleCancel(o.id)} size="sm">
                                <XCircle className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                            <Button variant="orange" onClick={() => handleStartNegotiation(o.id)} size="sm">
                                <TrendingDown className="w-4 h-4 mr-1" /> Bargain
                            </Button>
                            <Button variant="primary" onClick={() => handleConfirm(o.id)} size="sm">
                                <CheckCircle className="w-4 h-4 mr-1" /> Confirm
                            </Button>
                        </>
                    )}
                    {o.status === 'NEGOTIATION' && (
                        <>
                             <Button variant="secondary" onClick={() => handleCancel(o.id)} size="sm">
                                <XCircle className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                            <Button 
                                variant="orange" 
                                onClick={() => { 
                                    const freshOrder = orders.find(order => order.id === o.id) || o;
                                    setNegotiationOrder(freshOrder); 
                                    setView('negotiation'); 
                                }} 
                                size="sm"
                            >
                                <MessageSquare className="w-4 h-4 mr-1" /> Bargain
                            </Button>
                            <Button variant="primary" onClick={() => handleConfirm(o.id)} size="sm">
                                <CheckCircle className="w-4 h-4 mr-1" /> Confirm
                            </Button>
                        </>
                    )}
                    {(o.status === 'CONFIRMED' || o.status === 'PARTIALLY_RECEIVED') && (
                        <>
                             <Button variant="secondary" onClick={() => handleCancel(o.id)} size="sm">
                                <XCircle className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                            <Button variant="primary" onClick={() => openReceiveModal(o)} size="sm">
                                <Download className="w-4 h-4 mr-1" /> Receive Items
                            </Button>
                        </>
                    )}
                    {o.status === 'FULLY_RECEIVED' && (
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Fully Received
                        </span>
                    )}
                     {o.status === 'CANCELLED' && (
                        <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" /> Cancelled
                        </span>
                    )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-soft-cream grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {o.orderLines.map((line: PurchaseOrderLine) => (
                 <div key={line.id} className="bg-faded-white/50 p-3 rounded-xl flex flex-col gap-2 border border-soft-cream">
                    <div className="flex justify-between items-start gap-2">
                       <span className="text-xs font-bold text-gray-700 leading-tight">{line.product?.name}</span>
                       <span className="text-[11px] font-bold text-luxury-brown whitespace-nowrap">{line.receivedQty || 0} / {line.quantity}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-500 ${
                           line.receivedQty === line.quantity ? 'bg-emerald-500' : 'bg-indigo-500'
                         }`}
                         style={{ width: `${((line.receivedQty || 0) / line.quantity) * 100}%` }}
                       ></div>
                    </div>
                 </div>
               ))}
            </div>
          </Card>
        ))}
        {filteredOrders.length === 0 && (
           <div className="text-center py-20 bg-faded-white rounded-2xl border-2 border-dashed border-soft-cream">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-warm-taupe font-bold text-lg">No purchase orders found</p>
              <p className="text-warm-taupe/60 text-sm mt-1">Start by creating a new procurement request.</p>
           </div>
        )}
      </div>

      <Modal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} title="Receive Products">
        <form onSubmit={handleReceiveSubmit} className="space-y-6">
          <p className="text-sm text-warm-taupe font-medium italic">Enter the quantities physically received today:</p>
          <div className="space-y-3">
            {selectedOrder?.orderLines.map((line: PurchaseOrderLine) => (
              <div key={line.id} className="flex items-center justify-between p-4 bg-faded-white rounded-xl border border-soft-cream">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-soft-cream shadow-sm">
                    <Package className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm leading-tight">{line.product?.name}</p>
                    <p className="text-[10px] text-warm-taupe/60 font-bold uppercase mt-0.5">Remaining to receive: {line.quantity - (line.receivedQty || 0)}</p>
                  </div>
                </div>
                <div className="w-24">
                  <input 
                    type="number" 
                    min="0"
                    max={line.quantity - (line.receivedQty || 0)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-luxury-brown bg-white text-center font-bold"
                    value={receiveQtys[line.id] || 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReceiveQtys({...receiveQtys, [line.id]: Number(e.target.value)})}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowReceiveModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Receipt</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Purchase;
