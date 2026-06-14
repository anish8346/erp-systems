// frontend/src/pages/Products.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Package, X, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Input, Card, Badge, Modal, ConfirmDialog } from '../components/UI';
import type { Product, Vendor, ProcurementType, SupplyMethod, PaginationMeta } from '../types';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 20, totalPages: 0, totalItems: 0 });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [boms, setBoms] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustData, setAdjustData] = useState({ id: '', name: '', adjustment: 0, reason: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    salesPrice: 0,
    costPrice: 0,
    qtyOnHand: 0,
    minStock: 0,
    maxStock: 0,
    procurementType: 'MTS' as ProcurementType,
    supplyMethod: 'PURCHASE' as SupplyMethod,
    vendorId: '',
    bomId: '',
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const [prodRes, vendRes, bomRes] = await Promise.all([
        api.get('/products', { params: { page, limit: 20, searchTerm } }),
        api.get('/vendors'),
        api.get('/boms'),
      ]);
      setProducts(prodRes.data.products);
      setPagination(prodRes.data.pagination);
      setVendors(vendRes.data);
      setBoms(bomRes.data);
    } catch (err) {
      console.error("Fetch data failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(1);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    fetchData(newPage);
  };

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

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete}`);
      fetchData();
    } catch (err: unknown) {
      let errorMsg = "Operation failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      alert(errorMsg);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.vendor?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Products & Inventory</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your product catalog and real-time stock levels.</p>
        </div>
        <Button onClick={() => setShowModal(true)} variant="primary" className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              placeholder="Search by name, reference, or vendor..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-gray-300 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>{filteredProducts.length} Products found</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">Product & Ref</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">Vendor / Contact</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-center">Procurement</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-center">Safety Stock</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-right">Price</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-center">Stock Levels</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{p.name}</span>
                      <span className="text-[10px] font-mono text-gray-400 mt-0.5">#{p.id.slice(0,8).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {p.vendor ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {p.vendor.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-600 font-medium">{p.vendor.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 italic">Internal</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                        p.procurementType === 'MTO' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {p.procurementType === 'MTO' ? 'ON DEMAND' : 'MAKE TO STOCK'}
                      </span>
                      <span className="text-[9px] text-gray-400 font-medium uppercase ml-1 tracking-tight">{p.supplyMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Min / Max</span>
                      <span className="text-xs font-bold text-gray-600">{p.minStock} / {p.maxStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-semibold text-gray-900">₹{p.salesPrice.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-400 font-medium uppercase mt-0.5">Cost: ₹{p.costPrice.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-6">
                       <SimpleStockStat label="Hand" value={p.qtyOnHand} color="text-gray-600" />
                       <SimpleStockStat label="Res" value={p.qtyReserved} color="text-gray-400" />
                       <SimpleStockStat label="Free" value={p.qtyOnHand - p.qtyReserved} color="text-emerald-600" isBold />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 transition-opacity">
                      <button 
                        onClick={() => { setAdjustData({ id: p.id, name: p.name, adjustment: 0, reason: '' }); setShowAdjustModal(true); }}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Adjust Stock"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setEditingProduct({...p}); setShowEditModal(true); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Info"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setProductToDelete(p.id); setShowDeleteConfirm(true); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Package className="w-10 h-10 text-gray-100 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-medium">No products found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400">
            Showing <span className="text-gray-900">{products.length}</span> of <span className="text-gray-900">{pagination.totalItems}</span> products
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={pagination.page === 1 || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="px-2 h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 || 
                  pageNum === pagination.totalPages || 
                  (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        pagination.page === pageNum 
                          ? 'bg-gray-800 text-white shadow-sm' 
                          : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === pagination.page - 2 || 
                  pageNum === pagination.page + 2
                ) {
                  return <span key={pageNum} className="text-gray-400 text-xs mx-0.5">...</span>;
                }
                return null;
              })}
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={pagination.page === pagination.totalPages || loading}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="px-2 h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setProductToDelete(null); }}
        onConfirm={handleDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This will only work if the product is not used in any Sales Orders."
        confirmText="Delete Product"
        variant="danger"
      />

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

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Automation Rules</p>
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Min Stock (Reorder at)" 
                    type="number"
                    value={newProduct.minStock}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({...newProduct, minStock: Number(e.target.value)})}
                    required
                />
                <Input 
                    label="Max Stock (Target)" 
                    type="number"
                    value={newProduct.maxStock}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({...newProduct, maxStock: Number(e.target.value)})}
                    required
                />
            </div>
            <p className="text-[10px] text-blue-500 font-medium leading-tight">
                When availability falls below Min Stock, the system will automatically create a draft Purchase Order to reach Max Stock.
            </p>
          </div>

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

            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Automation Rules</p>
                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Min Stock (Reorder at)" 
                        type="number"
                        value={editingProduct.minStock}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProduct({...editingProduct, minStock: Number(e.target.value)})}
                        required
                    />
                    <Input 
                        label="Max Stock (Target)" 
                        type="number"
                        value={editingProduct.maxStock}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingProduct({...editingProduct, maxStock: Number(e.target.value)})}
                        required
                    />
                </div>
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

interface SimpleStockStatProps {
  label: string;
  value: number;
  color: string;
  isBold?: boolean;
}

const SimpleStockStat = ({ label, value, color, isBold }: SimpleStockStatProps) => (
  <div className="flex flex-col items-center min-w-[40px]">
    <span className="text-[9px] font-bold uppercase text-gray-400 tracking-tight mb-0.5">{label}</span>
    <span className={`text-xs ${isBold ? 'font-bold' : 'font-medium'} ${color}`}>{value}</span>
  </div>
);

export default Products;