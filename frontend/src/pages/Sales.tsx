
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, CheckCircle, Clock, ShoppingBag, Truck, AlertTriangle, Package, Search, XCircle, ArrowLeft, User as UserIcon, MapPin } from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/UI';
import type { SalesOrder, Product, SalesOrderLine, User } from '../types';
import axios from 'axios';

const Sales = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [deliverQtys, setDeliverQtys] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [currentOrder, setCurrentOrder] = useState<SalesOrder | null>(null);

  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerAddress: '',
    salesPersonId: '',
    productId: '',
    quantity: 1,
  });

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        api.get('/sales'),
        api.get('/products'),
        api.get('/config/users'),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Fetch sales data failed", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const product = products.find(p => p.id === newOrder.productId);
      if (!product) return;
      await api.post('/sales', {
        customerName: newOrder.customerName,
        customerAddress: newOrder.customerAddress,
        salesPersonId: newOrder.salesPersonId,
        orderLines: [{
          productId: newOrder.productId,
          quantity: newOrder.quantity,
          price: product.salesPrice,
        }]
      });
      setShowModal(false);
      setNewOrder({ customerName: '', customerAddress: '', salesPersonId: '', productId: '', quantity: 1 });
      fetchData();
    } catch (err: unknown) {
      let errorMsg = "Failed to create sales order";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      alert(errorMsg);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.post(`/sales/${id}/confirm`);
      fetchData();
      if (currentOrder && currentOrder.id === id) {
        const res = await api.get('/sales');
        const updated = res.data.find((o: SalesOrder) => o.id === id);
        setCurrentOrder(updated);
      }
    } catch (err: unknown) {
      let errorMsg = "Confirmation failed. Check logs for shortages.";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      alert(errorMsg);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.post(`/sales/${id}/cancel`);
      fetchData();
      if (currentOrder && currentOrder.id === id) {
        const res = await api.get('/sales');
        const updated = res.data.find((o: SalesOrder) => o.id === id);
        setCurrentOrder(updated);
      }
    } catch (err: unknown) {
      let errorMsg = "Cancellation failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      alert(errorMsg);
    }
  };

  const openDeliverModal = (order: SalesOrder) => {
    setSelectedOrder(order);
    const initialQtys: Record<string, number> = {};
    order.orderLines.forEach(line => {
      initialQtys[line.id] = line.quantity - (line.deliveredQty || 0);
    });
    setDeliverQtys(initialQtys);
    setShowDeliverModal(true);
  };

  const handleDeliverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const items = Object.keys(deliverQtys).map(lineId => ({
      lineId,
      quantity: Number(deliverQtys[lineId])
    })).filter(i => i.quantity > 0);

    try {
      await api.post(`/sales/${selectedOrder.id}/deliver`, { items });
      setShowDeliverModal(false);
      fetchData();
      if (currentOrder && currentOrder.id === selectedOrder.id) {
        const res = await api.get('/sales');
        const updated = res.data.find((o: SalesOrder) => o.id === selectedOrder.id);
        setCurrentOrder(updated);
      }
    } catch (err: unknown) {
      let errorMsg = "Delivery failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      alert(errorMsg);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDetail = (order: SalesOrder) => {
    setCurrentOrder(order);
    setView('detail');
  };

  if (view === 'detail' && currentOrder) {
    const isReadOnly = currentOrder.status !== 'DRAFT';
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <Button variant="secondary" onClick={() => setView('list')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to list
          </Button>
          <div className="flex gap-3">
             {currentOrder.status === 'DRAFT' && (
               <>
                 <Button variant="danger" onClick={() => handleCancel(currentOrder.id)}>
                   <XCircle className="w-4 h-4 mr-2" /> Cancel Order
                 </Button>
                 <Button onClick={() => handleConfirm(currentOrder.id)}>
                   <CheckCircle className="w-4 h-4 mr-2" /> Confirm Order
                 </Button>
               </>
             )}
             {(currentOrder.status === 'CONFIRMED' || currentOrder.status === 'PARTIALLY_DELIVERED') && (
               <>
                 <Button variant="danger" onClick={() => handleCancel(currentOrder.id)}>
                   <XCircle className="w-4 h-4 mr-2" /> Cancel Order
                 </Button>
                 <Button variant="primary" onClick={() => openDeliverModal(currentOrder)}>
                   <Truck className="w-4 h-4 mr-2" /> Deliver Items
                 </Button>
               </>
             )}
          </div>
        </div>

        <Card title={`Order ${currentOrder.id.slice(0,8).toUpperCase()}`} subtitle={`Status: ${currentOrder.status}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Customer</label>
                <p className="text-lg font-bold text-luxury-brown">{currentOrder.customerName}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Address</label>
                <p className="text-sm font-medium text-luxury-brown">{currentOrder.customerAddress || 'No address provided'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Sales Person</label>
                <p className="text-sm font-medium text-luxury-brown">{currentOrder.salesPerson?.name || 'Unassigned'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Creation Date</label>
                <p className="text-sm font-medium text-luxury-brown">{new Date(currentOrder.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-warm-taupe uppercase tracking-widest">Total Amount</label>
                <p className="text-2xl font-black text-luxury-brown">₹{currentOrder.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h4 className="font-bold text-luxury-brown mb-4 border-b pb-2">Order Lines</h4>
            <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                    <tr className="text-left text-[10px] font-bold text-warm-taupe uppercase tracking-widest">
                      <th className="pb-3">Product</th>
                      <th className="pb-3 text-center">Ordered</th>
                      <th className="pb-3 text-center">Delivered</th>
                      <th className="pb-3 text-center">Price</th>
                      <th className="pb-3 text-right">Subtotal</th>
                      <th className="pb-3 text-center">Availability</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 text-sm">
                    {currentOrder.orderLines.map(line => {
                      const freeToUse = (line.product?.qtyOnHand || 0) - (line.product?.qtyReserved || 0);
                      const isAvailable = freeToUse >= (line.quantity - line.deliveredQty);
                      return (
                        <tr key={line.id} className="group">
                          <td className="py-4">
                            <p className="font-bold text-luxury-brown">{line.product?.name}</p>
                          </td>
                          <td className="py-4 text-center font-semibold">{line.quantity}</td>
                          <td className="py-4 text-center font-semibold text-blue-600">{line.deliveredQty}</td>
                          <td className="py-4 text-center font-medium">₹{line.price}</td>
                          <td className="py-4 text-right font-bold text-luxury-brown">₹{(line.quantity * line.price).toLocaleString()}</td>
                          <td className="py-4 text-center">
                            {isAvailable ? (
                              <Badge variant="success">Available</Badge>
                            ) : (
                              <Badge variant="warning">Shortage: {Math.abs(freeToUse - (line.quantity - line.deliveredQty))}</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                 </tbody>
               </table>
            </div>
          </div>
        </Card>
        
        <Modal isOpen={showDeliverModal} onClose={() => setShowDeliverModal(false)} title="Process Delivery">
          <form onSubmit={handleDeliverSubmit} className="space-y-6">
            <p className="text-sm text-warm-taupe font-medium italic">Enter quantities for this partial or full shipment:</p>
            <div className="space-y-3">
              {currentOrder.orderLines.map((line: SalesOrderLine) => (
                <div key={line.id} className="flex items-center justify-between p-4 bg-faded-white rounded-xl border border-soft-cream">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-soft-cream shadow-sm">
                      <Package className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm leading-tight">{line.product?.name}</p>
                      <p className="text-[10px] text-warm-taupe/60 font-bold uppercase mt-0.5">Remaining: {line.quantity - (line.deliveredQty || 0)}</p>
                    </div>
                  </div>
                  <div className="w-24">
                    <input 
                      type="number" 
                      min="0"
                      max={line.quantity - (line.deliveredQty || 0)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-luxury-brown bg-white text-center font-bold"
                      value={deliverQtys[line.id] || 0}
                      onChange={(e) => setDeliverQtys({...deliverQtys, [line.id]: Number(e.target.value)})}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="secondary" type="button" onClick={() => setShowDeliverModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Confirm Shipment</Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">Sales Orders</h2>
          <p className="text-warm-taupe text-sm font-medium">Track customer orders and monitor fulfillment status.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="font-semibold">
          <Plus className="w-5 h-5" /> New Sales Order
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-soft-cream">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-taupe/60" />
          <input 
            placeholder="Search by customer or order ID..." 
            className="w-full pl-10 pr-4 py-2 bg-faded-white border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-brown/20 outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map((o) => {
          const isDelayed = o.status === 'CONFIRMED' && (new Date().getTime() - new Date(o.createdAt).getTime() > 2 * 24 * 60 * 60 * 1000);
          return (
          <Card key={o.id} className={`hover:shadow-md transition-all border-l-4 ${o.status === 'CANCELLED' ? 'border-l-gray-400 opacity-75' : isDelayed ? 'border-l-rose-500' : 'border-l-luxury-brown'} cursor-pointer`} onClick={() => openDetail(o)}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${
                  o.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 
                  o.status === 'PARTIALLY_DELIVERED' ? 'bg-amber-50 text-amber-600' : 
                  o.status === 'CONFIRMED' ? 'bg-indigo-50 text-indigo-600' : 
                  o.status === 'CANCELLED' ? 'bg-gray-50 text-gray-400' :
                  'bg-faded-white text-warm-taupe/60'
                }`}>
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-luxury-brown text-lg">{o.customerName}</h3>
                    <Badge variant={
                      o.status === 'DELIVERED' ? 'success' : 
                      o.status === 'PARTIALLY_DELIVERED' ? 'warning' : 
                      o.status === 'CONFIRMED' ? 'purple' : 
                      o.status === 'CANCELLED' ? 'neutral' :
                      'neutral'
                    }>
                      {o.status.replace('_', ' ')}
                    </Badge>
                    {isDelayed && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                        <AlertTriangle className="w-3 h-3" /> Delayed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-warm-taupe font-medium">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-[10px] text-gray-600">ORD-{o.id.slice(0,8).toUpperCase()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(o.createdAt).toLocaleDateString()}</span>
                    {o.salesPerson && <span className="flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" /> {o.salesPerson.name}</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3">
                <p className="text-2xl font-bold text-luxury-brown">₹{o.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  {o.status === 'DRAFT' && (
                    <>
                      <Button variant="ghost" onClick={() => handleCancel(o.id)} className="text-rose-500 hover:bg-rose-50">Cancel</Button>
                      <Button onClick={() => handleConfirm(o.id)} className="font-bold text-xs px-3 py-1.5">
                        Confirm
                      </Button>
                    </>
                  )}
                  {(o.status === 'CONFIRMED' || o.status === 'PARTIALLY_DELIVERED') && (
                    <Button variant="primary" onClick={() => openDeliverModal(o)} className="font-bold text-xs px-3 py-1.5">
                      Deliver
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-soft-cream grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {o.orderLines.map((line: SalesOrderLine) => (
                 <div key={line.id} className="bg-faded-white/50 p-3 rounded-xl flex flex-col gap-2 border border-soft-cream">
                    <div className="flex justify-between items-start gap-2">
                       <span className="text-xs font-bold text-gray-700 leading-tight">{line.product?.name}</span>
                       <span className="text-[11px] font-bold text-luxury-brown whitespace-nowrap">{line.deliveredQty || 0} / {line.quantity}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-500 ${
                           line.deliveredQty === line.quantity ? 'bg-emerald-500' : 'bg-luxury-brown'
                         }`}
                         style={{ width: `${((line.deliveredQty || 0) / line.quantity) * 100}%` }}
                       ></div>
                    </div>
                 </div>
               ))}
            </div>
          </Card>
        )})}
        {filteredOrders.length === 0 && (
           <div className="text-center py-20 bg-faded-white rounded-2xl border-2 border-dashed border-soft-cream">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-warm-taupe font-bold text-lg">No sales orders found</p>
              <p className="text-warm-taupe/60 text-sm mt-1">Start by creating a new order for your customers.</p>
           </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Sales Order">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Customer Name *" 
              placeholder="e.g. Acme Corp"
              value={newOrder.customerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOrder({...newOrder, customerName: e.target.value})}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Sales Person</label>
              <select 
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm"
                value={newOrder.salesPersonId}
                onChange={(e) => setNewOrder({...newOrder, salesPersonId: e.target.value})}
              >
                <option value="">Select Sales Person...</option>
                {users.filter(u => u.role === 'SALES').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <Input 
            label="Customer Address" 
            placeholder="Full delivery address"
            value={newOrder.customerAddress}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOrder({...newOrder, customerAddress: e.target.value})}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Select Product *</label>
              <select 
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm"
                value={newOrder.productId}
                onChange={(e) => setNewOrder({...newOrder, productId: e.target.value})}
                required
              >
                <option value="">Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.salesPrice})</option>
                ))}
              </select>
              {newOrder.productId && (
                <p className="text-[10px] font-bold text-emerald-600 ml-1">
                  Availability: {products.find(p => p.id === newOrder.productId)!.qtyOnHand - products.find(p => p.id === newOrder.productId)!.qtyReserved} units free
                </p>
              )}
            </div>
            <Input 
              label="Quantity *" 
              type="number"
              min="1"
              value={newOrder.quantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
              required
            />
          </div>

          <div className="bg-faded-white p-4 rounded-xl border border-soft-cream flex justify-between items-center">
             <span className="text-sm font-bold text-luxury-brown uppercase tracking-wider">Estimated Total</span>
             <span className="text-xl font-black text-luxury-brown">
                ₹{((products.find(p => p.id === newOrder.productId)?.salesPrice || 0) * newOrder.quantity).toLocaleString()}
             </span>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Create Draft Order</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeliverModal} onClose={() => setShowDeliverModal(false)} title="Process Delivery">
        <form onSubmit={handleDeliverSubmit} className="space-y-6">
          <p className="text-sm text-warm-taupe font-medium italic">Enter quantities for this partial or full shipment:</p>
          <div className="space-y-3">
            {selectedOrder?.orderLines.map((line: SalesOrderLine) => (
              <div key={line.id} className="flex items-center justify-between p-4 bg-faded-white rounded-xl border border-soft-cream">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-soft-cream shadow-sm">
                    <Package className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm leading-tight">{line.product?.name}</p>
                    <p className="text-[10px] text-warm-taupe/60 font-bold uppercase mt-0.5">Remaining to ship: {line.quantity - (line.deliveredQty || 0)}</p>
                  </div>
                </div>
                <div className="w-24">
                  <input 
                    type="number" 
                    min="0"
                    max={line.quantity - (line.deliveredQty || 0)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-luxury-brown bg-white text-center font-bold"
                    value={deliverQtys[line.id] || 0}
                    onChange={(e) => setDeliverQtys({...deliverQtys, [line.id]: Number(e.target.value)})}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowDeliverModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Shipment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;
