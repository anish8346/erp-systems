
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';
import { UserPlus, UserCircle2, Mail, Search, Clock, Shield } from 'lucide-react';
import { Button, Card, Input, Modal, Badge } from '../components/UI';
import type { User, UserRole } from '../types';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES' as UserRole
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/config/users');
      setUsers(res.data);
    } catch (err: unknown) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'SALES' });
      fetchUsers();
    } catch (err) {
      alert("Failed to create user. Email might exist.");
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-luxury-brown">User Management</h2>
          <p className="text-warm-taupe text-sm font-medium">Manage employees and control access permissions for Shiv Furniture Works.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="font-semibold">
          <UserPlus className="w-5 h-5" /> Add New Employee
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-soft-cream">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-taupe/60" />
          <input 
            placeholder="Search users by name, email or role..." 
            className="w-full pl-10 pr-4 py-2 bg-faded-white border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-brown/20 outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-all border-l-4 border-l-luxury-brown">
             <div className="flex items-start gap-4">
                <div className="bg-faded-white p-4 rounded-2xl text-luxury-brown border border-soft-cream shadow-sm">
                  <UserCircle2 className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-luxury-brown truncate text-lg leading-tight mb-1">{user.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-warm-taupe font-medium mb-4">
                    <Mail className="w-3.5 h-3.5 text-warm-taupe/60" /> {user.email}
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                    <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'OWNER' ? 'gold' : 'purple'}>
                      {user.role}
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] text-warm-taupe/60 font-bold uppercase tracking-tight">
                      <Clock className="w-3 h-3" /> {(user as { createdAt?: string }).createdAt && new Date((user as { createdAt?: string }).createdAt!).toLocaleDateString()}
                    </div>
                  </div>
                </div>
             </div>
          </Card>
        ))}
        {filteredUsers.length === 0 && (
           <div className="col-span-full py-20 text-center bg-faded-white rounded-2xl border-2 border-dashed border-soft-cream">
              <UserCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-warm-taupe font-bold text-lg">No users found</p>
              <p className="text-warm-taupe/60 text-sm mt-1">Search or add a new team member to get started.</p>
           </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Staff Member">
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-4">
             <Input 
               label="Full Name" 
               placeholder="Employee Name"
               value={formData.name}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
               required
             />
             <Input 
               label="Email Address" 
               type="email"
               placeholder="employee@shivfurniture.com"
               value={formData.email}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
               required
             />
             <Input 
               label="Initial Password" 
               type="password"
               placeholder="••••••••"
               value={formData.password}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})}
               required
             />
             <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">Access Role</label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-brown/10 focus:border-luxury-brown outline-none transition-all bg-white text-sm font-medium appearance-none"
                    value={formData.role}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, role: e.target.value as UserRole})}
                  >
                    <option value="ADMIN">Master Admin</option>
                    <option value="OWNER">Business Owner</option>
                    <option value="SALES">Sales Representative</option>
                    <option value="PURCHASE">Procurement Officer</option>
                    <option value="MFG">Manufacturing Lead</option>
                    <option value="INVENTORY">Warehouse Manager</option>
                  </select>
                  <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-taupe/60 pointer-events-none" />
                </div>
             </div>
           </div>
           
           <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Grant System Access</Button>
           </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
