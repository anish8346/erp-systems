
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Package, X, ArrowUpRight } from 'lucide-react';
import { Button, Input, Card, Badge, Modal } from '../components/UI';
import type { Product, Vendor, ProcurementType, SupplyMethod } from '../types';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [boms, setBoms] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustData, setAdjustData] = useState({ id: '', name: '', adjustment: 0, reason: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    salesPrice: 0,
    costPrice: 0,
    qtyOnHand: 0,
    procurementType: 'MTS' as ProcurementType,
    supplyMethod: 'PURCHASE' as SupplyMethod,
    vendorId: '',
  });

  const fetchData = async () => {
    try {
      const [prodRes, vendRes, bomRes] = await Promise.all([
        api.get('/products'),
        api.get('/vendors'),
        api.get('/manufacturing/boms'),
      ]);
      setProducts(prodRes.data);
      setVendors(vendRes.data);
      setBoms(bomRes.data);
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
      await api.post('/products', newProduct);
      setShowModal(false);
      setNewProduct({ name: '', salesPrice: 0, costPrice: 0, qtyOnHand: 0, procurementType: 'MTS', supplyMethod: 'PURCHASE', vendorId: '' });
      fetchData();
    } catch (err: unknown) {
      let errorMsg = "Operation failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      alert(errorMsg);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await api.put(`/products/${editingProduct.id}`, editingProduct);
      setShowEditModal(false);
      fetchData();
    } catch (err: unknown) {
      let errorMsg = "Operation failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      alert(errorMsg);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/products/${adjustData.id}/adjust-stock`, {
        adjustment: adjustData.adjustment,
        reason: adjustData.reason
      });
      setShowAdjustModal(false);
      setAdjustData({ id: '', name: '', adjustment: 0, reason: '' });
      fetchData();
    } catch (err: unknown) {
      let errorMsg = "Operation failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      alert(errorMsg);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product? This will only work if the product is not used in any Sales Orders.")) {
      try {
        await api.delete(`/products/${id}`);
        fetchData();
      } catch (err: unknown) {
        let errorMsg = "Operation failed";
        if (axios.isAxiosError(err)) {
          errorMsg = err.response?.data?.error || errorMsg;
        }
        alert(errorMsg);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">Inventory</h2>
          <p className="text-warm-taupe text-sm font-medium">Manage products, stock levels, and procurement strategies.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="font-semibold">
          <Plus className="w-5 h-5" /> Add New Product
        </Button>
      </div>

      <Card className="overflow-hidden border-none shadow-lg bg-white/50 backdrop-blur-md">
        <div className="p-4 border-b border-soft-cream bg-white flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-taupe/60" />
            <input 
              placeholder="Search inventory..." 
              className="w-full pl-10 pr-4 py-2 bg-faded-white border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" size="sm" className="font-semibold">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-faded-white/50">
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-warm-taupe/60">Product Info</th>
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-warm-taupe/60">Procurement</th>
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-warm-taupe/60 text-right">Pricing</th>
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-warm-taupe/60 text-center">Stock Details</th>
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-warm-taupe/60 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-5">
                    <p className="font-bold text-luxury-brown">{p.name}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-xs text-warm-taupe/60 font-mono mt-0.5">{p.id.slice(0,8)}</span>
                       {p.vendor && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">V: {p.vendor.name}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col gap-1">
                  <Badge variant={p.procurementType === 'MTO' ? 'orange' : 'success'}>
                    {p.procurementType === 'MTO' ? 'Procure on Demand' : 'Make to Stock'}
                  </Badge>
                  <span className="text-[10px] font-semibold text-warm-taupe/60 uppercase tracking-wider">via {p.supplyMethod}</span>
                </div>
              </td>
              <td className="px-4 py-5 text-right">
                <p className="font-bold text-luxury-brown">₹{p.salesPrice.toFixed(2)}</p>
                <p className="text-[10px] text-warm-taupe/60 font-bold uppercase">Cost: ₹{p.costPrice.toFixed(2)}</p>
              </td>
              <td className="px-4 py-5">
                <div className="flex items-center justify-center gap-4">
                   <StockStat label="On Hand" value={p.qtyOnHand} color="text-luxury-brown" />
                   <StockStat label="Reserved" value={p.qtyReserved} color="text-blue-600" />
                   <StockStat label="Free to Use" value={p.qtyOnHand - p.qtyReserved} color="text-emerald-600" bold />
                </div>
              </td>
                  <td className="px-4 py-5 text-right">
                    <div className="flex justify-end gap-1 transition-opacity">
                      <button 
                        title="Adjust Stock"
                        onClick={() => { setAdjustData({ id: p.id, name: p.name, adjustment: 0, reason: '' }); setShowAdjustModal(true); }}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      <button 
                        title="Edit Info"
                        onClick={() => { setEditingProduct({...p}); setShowEditModal(true); }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        title="Delete Product"
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-warm-taupe/60 font-medium">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE MODAL */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Product">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Product Name" 
            placeholder="e.g. Wooden Dining Table"
            value={newProduct.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({...newProduct, name: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Sales Price (₹)" 
              type="number"
              step="0.01"
              value={newProduct.salesPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({...newProduct, salesPrice: Number(e.target.value)})}
              required
            />
            <Input 
              label="Cost Price (₹)" 
              type="number"
              step="0.01"
              value={newProduct.costPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({...newProduct, costPrice: Number(e.target.value)})}
              required
            />
          </div>
          
          <div className="p-4 bg-faded-white rounded-xl border border-soft-cream space-y-4">
            <div className="flex items-center gap-3">
                <input 
                    type="checkbox" 
                    id="procureOnDemand"
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    checked={newProduct.procurementType === 'MTO'}
                    onChange={(e) => setNewProduct({
                        ...newProduct, 
                        procurementType: e.target.checked ? 'MTO' : 'MTS'
                    })}
                />
                <label htmlFor="procureOnDemand" className="text-sm font-bold text-luxury-brown">Procure on Demand (MTO)</label>
            </div>

            {newProduct.procurementType === 'MTO' && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Supply Method</label>
                        <select 
                            className="px-3 py-2 border border-soft-cream rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none bg-white text-sm"
                            value={newProduct.supplyMethod}
                            onChange={(e) => setNewProduct({...newProduct, supplyMethod: e.target.value as SupplyMethod})}
                            required
                        >
                            <option value="PURCHASE">Purchase</option>
                            <option value="MANUFACTURE">Manufacture</option>
                        </select>
                    </div>
                    {newProduct.supplyMethod === 'PURCHASE' ? (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Vendor</label>
                            <select 
                                className="px-3 py-2 border border-soft-cream rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none bg-white text-sm"
                                value={newProduct.vendorId}
                                onChange={(e) => setNewProduct({...newProduct, vendorId: e.target.value})}
                                required
                            >
                                <option value="">Select Vendor...</option>
                                {vendors.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">BoM</label>
                            <select 
                                className="px-3 py-2 border border-soft-cream rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none bg-white text-sm"
                                value={newProduct.bomId || ''}
                                onChange={(e) => setNewProduct({...newProduct, bomId: e.target.value})}
                                required
                            >
                                <option value="">Select BoM...</option>
                                {boms.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
          </div>

          <Input 
            label="Initial Stock Quantity" 
            type="number"
            value={newProduct.qtyOnHand}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({...newProduct, qtyOnHand: Number(e.target.value)})}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Create Product</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Product Info">
        {editingProduct && (
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <Input 
              label="Product Name" 
              value={editingProduct.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProduct({...editingProduct, name: e.target.value})}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Sales Price (₹)" 
                type="number"
                step="0.01"
                value={editingProduct.salesPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProduct({...editingProduct, salesPrice: Number(e.target.value)})}
                required
              />
              <Input 
                label="Cost Price (₹)" 
                type="number"
                step="0.01"
                value={editingProduct.costPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProduct({...editingProduct, costPrice: Number(e.target.value)})}
                required
              />
            </div>

            <div className="p-4 bg-faded-white rounded-xl border border-soft-cream space-y-4">
                <div className="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        id="editProcureOnDemand"
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                        checked={editingProduct.procurementType === 'MTO'}
                        onChange={(e) => setEditingProduct({
                            ...editingProduct, 
                            procurementType: e.target.checked ? 'MTO' : 'MTS'
                        })}
                    />
                    <label htmlFor="editProcureOnDemand" className="text-sm font-bold text-luxury-brown">Procure on Demand (MTO)</label>
                </div>

                {editingProduct.procurementType === 'MTO' && (
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Supply Method</label>
                            <select 
                                className="px-3 py-2 border border-soft-cream rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none bg-white text-sm"
                                value={editingProduct.supplyMethod}
                                onChange={(e) => setEditingProduct({...editingProduct, supplyMethod: e.target.value as SupplyMethod})}
                                required
                            >
                                <option value="PURCHASE">Purchase</option>
                                <option value="MANUFACTURE">Manufacture</option>
                            </select>
                        </div>
                        {editingProduct.supplyMethod === 'PURCHASE' ? (
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Vendor</label>
                                <select 
                                    className="px-3 py-2 border border-soft-cream rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none bg-white text-sm"
                                    value={editingProduct.vendorId || ''}
                                    onChange={(e) => setEditingProduct({...editingProduct, vendorId: e.target.value})}
                                    required
                                >
                                    <option value="">Select Vendor...</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">BoM</label>
                                <select 
                                    className="px-3 py-2 border border-soft-cream rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none bg-white text-sm"
                                    value={editingProduct.bomId || ''}
                                    onChange={(e) => setEditingProduct({...editingProduct, bomId: e.target.value})}
                                    required
                                >
                                    <option value="">Select BoM...</option>
                                    {boms.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}                                </select>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit">Update Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ADJUST STOCK MODAL */}
      <Modal isOpen={showAdjustModal} onClose={() => setShowAdjustModal(false)} title="Adjust Stock Levels">
         <form onSubmit={handleAdjustSubmit} className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
               <Package className="w-8 h-8 text-blue-500" />
               <div>
                  <p className="font-bold text-blue-900">{adjustData.name}</p>
                  <p className="text-xs text-blue-600">Enter a positive number to add stock, negative to remove.</p>
               </div>
            </div>
            
            <Input 
              label="Adjustment Quantity" 
              type="number"
              placeholder="e.g. 10 or -5"
              value={adjustData.adjustment}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustData({...adjustData, adjustment: Number(e.target.value)})}
              required
            />

            <Input 
              label="Reason for Adjustment" 
              placeholder="e.g. Damaged items or Physical count correction"
              value={adjustData.reason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustData({...adjustData, reason: e.target.value})}
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" type="button" onClick={() => setShowAdjustModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Confirm Adjustment</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
};

interface StockStatProps {
  label: string;
  value: number;
  color: string;
  bold?: boolean;
}

const StockStat = ({ label, value, color, bold }: StockStatProps) => (
  <div className="flex flex-col items-center">
    <span className="text-[9px] font-semibold uppercase text-warm-taupe/60 tracking-wider mb-0.5">{label}</span>
    <span className={`text-sm ${bold ? 'font-bold' : 'font-medium'} ${color}`}>{value}</span>
  </div>
);

export default Products;

