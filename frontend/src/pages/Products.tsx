import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Search, Filter, MoreVertical } from 'lucide-react';
import { Button, Input, Card, Badge, Modal } from '../components/UI';

interface Product {
  id: string;
  name: string;
  salesPrice: number;
  costPrice: number;
  qtyOnHand: number;
  qtyReserved: number;
  procurementType: string;
  supplyMethod: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    salesPrice: 0,
    costPrice: 0,
    qtyOnHand: 0,
    procurementType: 'MTS',
    supplyMethod: 'PURCHASE',
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch products failed", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', newProduct);
      setShowModal(false);
      setNewProduct({ name: '', salesPrice: 0, costPrice: 0, qtyOnHand: 0, procurementType: 'MTS', supplyMethod: 'PURCHASE' });
      fetchProducts();
    } catch (err) {
      alert("Failed to create product");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Inventory</h2>
          <p className="text-gray-500">Manage products, stock levels, and procurement strategies.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5" /> Add New Product
        </Button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="md:w-auto">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Product Info</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Procurement</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Pricing</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Stock Details</th>
                <th className="px-4 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-5">
                    <p className="font-bold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{p.id.slice(0,8)}</p>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col gap-1">
                      <Badge variant={p.procurementType === 'MTO' ? 'warning' : 'success'}>
                        {p.procurementType}
                      </Badge>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">via {p.supplyMethod}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <p className="font-bold text-gray-900">${p.salesPrice.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Cost: ${p.costPrice.toFixed(2)}</p>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-4">
                       <StockStat label="On Hand" value={p.qtyOnHand} color="text-gray-900" />
                       <StockStat label="Reserved" value={p.qtyReserved} color="text-blue-600" />
                       <StockStat label="Free" value={p.qtyOnHand - p.qtyReserved} color="text-green-600" bold />
                    </div>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 italic">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Product">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Product Name" 
            placeholder="e.g. Wooden Dining Table"
            value={newProduct.name}
            onChange={(e: any) => setNewProduct({...newProduct, name: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Sales Price (₹)" 
              type="number"
              step="0.01"
              value={newProduct.salesPrice}
              onChange={(e: any) => setNewProduct({...newProduct, salesPrice: Number(e.target.value)})}
              required
            />
            <Input 
              label="Cost Price (₹)" 
              type="number"
              step="0.01"
              value={newProduct.costPrice}
              onChange={(e: any) => setNewProduct({...newProduct, costPrice: Number(e.target.value)})}
              required
            />
          </div>
          <Input 
            label="Initial Stock Quantity" 
            type="number"
            value={newProduct.qtyOnHand}
            onChange={(e: any) => setNewProduct({...newProduct, qtyOnHand: Number(e.target.value)})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Procurement Strategy</label>
              <select 
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={newProduct.procurementType}
                onChange={(e) => setNewProduct({...newProduct, procurementType: e.target.value})}
              >
                <option value="MTS">Make To Stock (MTS)</option>
                <option value="MTO">Make To Order (MTO)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Supply Method</label>
              <select 
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={newProduct.supplyMethod}
                onChange={(e) => setNewProduct({...newProduct, supplyMethod: e.target.value})}
              >
                <option value="PURCHASE">Purchase from Vendor</option>
                <option value="MANUFACTURE">Manufacture In-House</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Create Product</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const StockStat = ({ label, value, color, bold }: any) => (
  <div className="flex flex-col items-center">
    <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-0.5">{label}</span>
    <span className={`text-sm ${bold ? 'font-black' : 'font-bold'} ${color}`}>{value}</span>
  </div>
);

export default Products;
