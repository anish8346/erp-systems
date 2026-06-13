import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Download } from 'lucide-react';

interface PurchaseOrder {
  id: string;
  vendorName: string;
  status: string;
  totalAmount: number;
}

const Purchase = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    vendorName: '',
    productId: '',
    quantity: 1,
  });

  const fetchData = async () => {
    const [ordersRes, productsRes] = await Promise.all([
      api.get('/purchase'),
      api.get('/products'),
    ]);
    setOrders(ordersRes.data);
    setProducts(productsRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === newOrder.productId);
    await api.post('/purchase', {
      vendorName: newOrder.vendorName,
      orderLines: [{
        productId: newOrder.productId,
        quantity: newOrder.quantity,
        price: product.costPrice,
      }]
    });
    setShowForm(false);
    fetchData();
  };

  const handleReceive = async (id: string) => {
    await api.post(`/purchase/${id}/receive`);
    fetchData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Procurement Orders</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> New Procurement
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create Procurement Order</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input 
              placeholder="Vendor Name" 
              className="border p-2 rounded"
              value={newOrder.vendorName}
              onChange={(e) => setNewOrder({...newOrder, vendorName: e.target.value})}
              required
            />
            <select 
              className="border p-2 rounded"
              value={newOrder.productId}
              onChange={(e) => setNewOrder({...newOrder, productId: e.target.value})}
              required
            >
              <option value="">Select Product to Buy</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Cost: ₹{p.costPrice})</option>
              ))}            </select>
            <input 
              type="number" 
              placeholder="Quantity" 
              className="border p-2 rounded"
              value={newOrder.quantity}
              onChange={(e) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
              required
            />
            <div className="col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create PO</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-700">Order ID</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Vendor</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Total</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-6 py-4 font-mono text-sm">{o.id.slice(0,8)}</td>
                <td className="px-6 py-4">{o.vendorName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    o.status === 'RECEIVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4">₹{o.totalAmount}</td>
                <td className="px-6 py-4">
                  {o.status === 'DRAFT' && (
                    <button 
                      onClick={() => handleReceive(o.id)}
                      className="text-green-600 hover:text-green-800 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" /> Receive Products
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Purchase;
