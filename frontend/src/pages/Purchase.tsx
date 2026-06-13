
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';
import { Plus, Download, Truck, ShoppingCart, Package, Search, Clock } from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/UI';
import type { PurchaseOrder, Product, Vendor, PurchaseOrderLine } from '../types';

const Purchase = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [receiveQtys, setReceiveQtys] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const [newOrder, setNewOrder] = useState({
    vendorId: '',
    productId: '',
    quantity: 1,
  });

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes, vendorsRes] = await Promise.all([
        api.get('/purchase'),
        api.get('/products'),
        api.get('/vendors'),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setVendors(vendorsRes.data);
    } catch (err) {
      console.error("Fetch data failed", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const product = products.find(p => p.id === newOrder.productId);
      const vendor = vendors.find(v => v.id === newOrder.vendorId);
      if (!product) return;
      
      await api.post('/purchase', {
        vendorId: newOrder.vendorId,
        vendorName: vendor?.name || 'Unknown',
        orderLines: [{
          productId: newOrder.productId,
          quantity: newOrder.quantity,
          price: product.costPrice,
        }]
      });
      setShowForm(false);
      setNewOrder({ vendorId: '', productId: '', quantity: 1 });
      fetchData();
    } catch (err: unknown) {
      let errorMsg = "Failed to create procurement order";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      alert(errorMsg);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">Purchase Orders</h2>
          <p className="text-warm-taupe text-sm font-medium">Manage vendor purchases and stock replenishment.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="font-semibold">
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
          <Card key={o.id} className="hover:shadow-md transition-all border-l-4 border-l-luxury-brown">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${
                  o.status === 'RECEIVED' ? 'bg-emerald-50 text-emerald-600' : 
                  o.status === 'PARTIALLY_RECEIVED' ? 'bg-amber-50 text-amber-600' : 
                  'bg-indigo-50 text-indigo-600'
                }`}>
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-luxury-brown text-lg">{o.vendorName}</h3>
                    <Badge variant={
                      o.status === 'RECEIVED' ? 'success' : 
                      o.status === 'PARTIALLY_RECEIVED' ? 'warning' : 
                      'purple'
                    }>
                      {o.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-warm-taupe font-medium">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-[10px] text-gray-600">PUR-{o.id.slice(0,8).toUpperCase()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3">
                <p className="text-2xl font-bold text-luxury-brown">₹{o.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                {o.status !== 'RECEIVED' ? (
                  <Button variant="primary" onClick={() => openReceiveModal(o)} className="font-bold">
                    <Download className="w-4 h-4" /> Receive Items
                  </Button>
                ) : (
                   <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                     <CheckCircle className="w-3.5 h-3.5" /> Fully Received
                   </span>
                )}
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

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Purchase Order">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 ml-1">Vendor</label>
            <select 
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm"
              value={newOrder.vendorId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewOrder({...newOrder, vendorId: e.target.value})}
              required
            >
              <option value="">Select a vendor...</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Product</label>
              <select 
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm"
                value={newOrder.productId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewOrder({...newOrder, productId: e.target.value})}
                required
              >
                <option value="">Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.costPrice})</option>
                ))}
              </select>
            </div>
            <Input 
              label="Quantity" 
              type="number"
              min="1"
              value={newOrder.quantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">Create Order</Button>
          </div>
        </form>
      </Modal>

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

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Purchase;
