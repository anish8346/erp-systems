// frontend/src/pages/sales/SalesForm.tsx
import React, { useState } from 'react';
import { Modal, Input, Button } from '../../components/UI';
import { Users, User as UserIcon } from 'lucide-react';
import type { Product, User, Customer } from '../../types';
import UserSelectModal from './UserSelectModal';
import CustomerSelectModal from './CustomerSelectModal';

interface SalesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newOrder: {
    customerName: string;
    customerAddress: string;
    salesPersonId: string;
    productId: string;
    quantity: number;
    customerId?: string;
    taxRate?: number;
  };
  setNewOrder: React.Dispatch<React.SetStateAction<{
    customerName: string;
    customerAddress: string;
    salesPersonId: string;
    productId: string;
    quantity: number;
    customerId?: string;
    taxRate?: number;
  }>>;
  products: Product[];
  users: User[];
}

const SalesForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  newOrder, 
  setNewOrder, 
  products, 
  users 
}: SalesFormProps) => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const selectedProduct = products.find(p => p.id === newOrder.productId);

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="New Sales Order">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-700">Customer Name *</label>
                <button 
                  type="button" 
                  onClick={() => setShowCustomerModal(true)}
                  className="text-[10px] font-black text-luxury-brown uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  <UserIcon className="w-3 h-3" /> Select from Database
                </button>
            </div>
            <Input 
              placeholder="e.g. Acme Corp"
              value={newOrder.customerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOrder({...newOrder, customerName: e.target.value, customerId: undefined})}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-700">Sales Person</label>
                <button 
                  type="button" 
                  onClick={() => setShowUserModal(true)}
                  className="text-[10px] font-black text-luxury-brown uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  <Users className="w-3 h-3" /> Select from Team
                </button>
            </div>
            <select 
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm font-medium"
              value={newOrder.salesPersonId}
              onChange={(e) => setNewOrder({...newOrder, salesPersonId: e.target.value})}
            >
              <option value="">Select Sales Person...</option>
              {users.filter(u => u.role === 'SALES' || u.role === 'ADMIN' || u.role === 'OWNER').map(u => (
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
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm font-medium"
              value={newOrder.productId}
              onChange={(e) => setNewOrder({...newOrder, productId: e.target.value})}
              required
            >
              <option value="">Select a product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (₹{p.salesPrice.toLocaleString()})</option>
              ))}
            </select>
            {selectedProduct && (
              <p className="text-[10px] font-bold text-emerald-600 ml-1">
                Availability: {selectedProduct.qtyOnHand - selectedProduct.qtyReserved} units free
              </p>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <Input 
                label="Quantity *" 
                type="number"
                min="1"
                value={newOrder.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
                required
            />
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">Tax (GST) *</label>
                <select 
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm font-medium"
                value={newOrder.taxRate || 0}
                onChange={(e) => setNewOrder({...newOrder, taxRate: Number(e.target.value)})}
                required
                >
                <option value={0}>0% (Tax Exempt)</option>
                <option value={18}>18% (Standard GST)</option>
                </select>
            </div>
          </div>
        </div>

        <div className="bg-faded-white p-4 rounded-xl border border-soft-cream space-y-2">
           <div className="flex justify-between items-center text-warm-taupe">
              <span className="text-[10px] font-bold uppercase tracking-widest">Subtotal</span>
              <span className="text-sm font-bold">₹{((selectedProduct?.salesPrice || 0) * newOrder.quantity).toLocaleString()}</span>
           </div>
           <div className="flex justify-between items-center text-warm-taupe border-b border-gray-200 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest">GST ({newOrder.taxRate || 0}%)</span>
              <span className="text-sm font-bold">₹{(((selectedProduct?.salesPrice || 0) * newOrder.quantity) * (newOrder.taxRate || 0) / 100).toLocaleString()}</span>
           </div>
           <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-warm-taupe uppercase tracking-widest">Grand Total</span>
              <span className="text-xl font-black text-luxury-brown">
                  ₹{(((selectedProduct?.salesPrice || 0) * newOrder.quantity) * (1 + (newOrder.taxRate || 0) / 100)).toLocaleString()}
              </span>
           </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create Draft Order</Button>
        </div>
      </form>
    </Modal>

    <UserSelectModal 
      isOpen={showUserModal}
      onClose={() => setShowUserModal(false)}
      users={users}
      onSelect={(u) => setNewOrder({...newOrder, salesPersonId: u.id})}
    />

    <CustomerSelectModal 
      isOpen={showCustomerModal}
      onClose={() => setShowCustomerModal(false)}
      onSelect={(c: Customer) => setNewOrder({
          ...newOrder, 
          customerName: c.name, 
          customerAddress: c.address || '', 
          customerId: c.id
      })}
    />
    </>
  );
};

export default SalesForm;
