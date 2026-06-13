import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/UI';

interface SalesOrder {
  id: string;
  customerName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  orderLines: any[];
}

const Sales = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    productId: '',
    quantity: 1,
  });

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/sales'),
        api.get('/products'),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
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
      await api.post('/sales', {
        customerName: newOrder.customerName,
        orderLines: [{
          productId: newOrder.productId,
          quantity: newOrder.quantity,
          price: product.salesPrice,
        }]
      });
      setShowModal(false);
      setNewOrder({ customerName: '', productId: '', quantity: 1 });
      fetchData();
    } catch (err) {
      alert("Failed to create sales order");
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.post(`/sales/${id}/confirm`);
      fetchData();
    } catch (err) {
      alert("Confirmation failed. Check logs for shortages.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Sales Management</h2>
          <p className="text-gray-500">Track customer orders and monitor fulfillment status.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5" /> New Sales Order
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((o) => (
          <Card key={o.id} className="hover:border-blue-200 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${o.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-gray-900 text-lg">{o.customerName}</h3>
                    <Badge variant={o.status === 'CONFIRMED' ? 'primary' : 'neutral'}>
                      {o.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="font-mono bg-gray-100 px-1.5 rounded uppercase text-[10px]">{o.id.slice(0,8)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <p className="text-2xl font-black text-gray-900">₹{o.totalAmount.toFixed(2)}</p>
                {o.status === 'DRAFT' ? (
                  <Button size="sm" onClick={() => handleConfirm(o.id)}>
                    <CheckCircle className="w-4 h-4" /> Confirm Order
                  </Button>
                ) : (
                   <span className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                     <CheckCircle className="w-4 h-4" /> Order Processed
                   </span>
                )}
              </div>
            </div>
            
            {/* Quick Line Items Preview */}
            <div className="mt-4 pt-4 border-t border-gray-50 flex gap-4 overflow-x-auto pb-2">
               {o.orderLines.map((line: any) => (
                 <div key={line.id} className="bg-gray-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-100 whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-800">{line.product.name}</span>
                    <span className="text-[10px] font-black bg-white px-1.5 py-0.5 rounded border border-gray-100 text-blue-600">x{line.quantity}</span>
                 </div>
               ))}
            </div>
          </Card>
        ))}
        {orders.length === 0 && (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No sales orders found. Create your first one!</p>
           </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Sales Order">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Customer Name" 
            placeholder="e.g. Acme Corp"
            value={newOrder.customerName}
            onChange={(e: any) => setNewOrder({...newOrder, customerName: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Select Product</label>
              <select 
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={newOrder.productId}
                onChange={(e) => setNewOrder({...newOrder, productId: e.target.value})}
                required
              >
                <option value="">Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.salesPrice})</option>
                ))}
              </select>
            </div>
            <Input 
              label="Quantity" 
              type="number"
              min="1"
              value={newOrder.quantity}
              onChange={(e: any) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Create Sales Order</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;
