
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, User, Phone, Mail, MapPin } from 'lucide-react';
import { Button, Card, Input, Modal } from '../components/UI';
import type { Vendor } from '../types';

const Vendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendors');
      setVendors(res.data);
    } catch (err) {
      console.error("Fetch vendors failed", err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vendors', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
      fetchVendors();
    } catch (err) {
      alert("Failed to create vendor");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown tracking-tight">Vendors</h2>
          <p className="text-warm-taupe mt-1">Manage your suppliers and contact information.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5" /> Add New Vendor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((v) => (
          <Card key={v.id} className="p-0 hover:shadow-md transition-all">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-faded-white text-luxury-brown rounded-lg text-lg font-bold border border-soft-cream">
                  {v.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-luxury-brown text-lg leading-tight">{v.name}</h3>
                  <p className="text-xs text-warm-taupe mt-1 font-semibold tracking-wider uppercase opacity-60">VEN-{v.id.slice(0,8).toUpperCase()}</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-soft-cream">
                <div className="flex items-center gap-3 text-sm text-warm-taupe">
                  <Mail className="w-4 h-4 opacity-70" />
                  <span className="truncate">{v.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-warm-taupe">
                  <Phone className="w-4 h-4 opacity-70" />
                  <span>{v.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-warm-taupe">
                  <MapPin className="w-4 h-4 opacity-70" />
                  <span className="truncate">{v.address || 'No address provided'}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {vendors.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-soft-cream">
             <User className="w-12 h-12 text-warm-taupe/20 mx-auto mb-4" />
             <p className="text-warm-taupe font-medium">No vendors found. Add your first supplier!</p>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register New Vendor">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Vendor Name" 
            placeholder="e.g. Reliance Wood Supplies"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Email Address" 
              type="email"
              placeholder="vendor@example.com"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              label="Phone Number" 
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <Input 
            label="Business Address" 
            placeholder="Full office/warehouse address"
            value={formData.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, address: e.target.value})}
          />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Create Vendor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vendors;
