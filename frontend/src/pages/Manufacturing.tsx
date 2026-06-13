import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Factory, PlayCircle } from 'lucide-react';

interface ManufacturingOrder {
  id: string;
  productId: string;
  product: any;
  quantity: number;
  status: string;
  bomId: string;
}

const Manufacturing = () => {
  const [mos, setMos] = useState<ManufacturingOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [boms, setBoms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newMO, setNewMO] = useState({
    productId: '',
    quantity: 1,
    bomId: '',
  });

  const fetchData = async () => {
    const [mosRes, productsRes, bomsRes] = await Promise.all([
      api.get('/manufacturing'),
      api.get('/products'),
      api.get('/boms'),
    ]);
    setMos(mosRes.data);
    setProducts(productsRes.data);
    setBoms(bomsRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/manufacturing', newMO);
    setShowForm(false);
    fetchData();
  };

  const handleProduce = async (id: string) => {
    await api.post(`/manufacturing/${id}/produce`);
    fetchData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manufacturing Orders</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Factory className="w-4 h-4 mr-2" /> New MO
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Plan Production</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <select 
              className="border p-2 rounded w-full"
              value={newMO.productId}
              onChange={(e) => {
                const prod = products.find(p => p.id === e.target.value);
                setNewMO({...newMO, productId: e.target.value, bomId: prod?.bomId || ''});
              }}
              required
            >
              <option value="">Select Finished Good</option>
              {products && products.length > 0 ? (
                products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              ) : (
                <option disabled>No products available</option>
              )}
            </select>
            <input 
              type="number" 
              placeholder="Quantity" 
              className="border p-2 rounded"
              value={newMO.quantity}
              onChange={(e) => setNewMO({...newMO, quantity: Number(e.target.value)})}
              required
            />
            <div className="col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Plan MO</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-700">MO ID</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Product</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Quantity</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mos.map((m) => (
              <tr key={m.id}>
                <td className="px-6 py-4 font-mono text-sm">{m.id.slice(0,8)}</td>
                <td className="px-6 py-4">{m.product.name}</td>
                <td className="px-6 py-4">{m.quantity}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    m.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {(m.status === 'DRAFT' || m.status === 'CONFIRMED') && (
                    <button 
                      onClick={() => handleProduce(m.id)}
                      className="text-purple-600 hover:text-purple-800 flex items-center"
                    >
                      <PlayCircle className="w-4 h-4 mr-1" /> Produce
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

export default Manufacturing;
