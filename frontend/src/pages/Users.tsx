import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserPlus, UserCircle2, Mail, ShieldCheck } from 'lucide-react';
import { Button, Card, Input, Modal, Badge } from '../components/UI';

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES'
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/config/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Staff Management</h2>
          <p className="text-gray-500">Add and manage employees of Shiv Furniture Works.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <UserPlus className="w-5 h-5" /> Add New Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="hover:border-blue-200 transition-all border-l-4 border-l-blue-500">
             <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                  <UserCircle2 className="w-10 h-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <Mail className="w-3 h-3" /> {user.email}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={user.role === 'ADMIN' ? 'danger' : 'primary'}>
                      {user.role}
                    </Badge>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
             </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Staff Member">
        <form onSubmit={handleSubmit} className="space-y-5">
           <Input 
             label="Full Name" 
             placeholder="Employee Name"
             value={formData.name}
             onChange={(e: any) => setFormData({...formData, name: e.target.value})}
             required
           />
           <Input 
             label="Email Address" 
             type="email"
             placeholder="employee@shiv.com"
             value={formData.email}
             onChange={(e: any) => setFormData({...formData, email: e.target.value})}
             required
           />
           <Input 
             label="Temporary Password" 
             type="password"
             value={formData.password}
             onChange={(e: any) => setFormData({...formData, password: e.target.value})}
             required
           />
           <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Access Role</label>
              <select 
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="ADMIN">Master Admin</option>
                <option value="OWNER">Business Owner</option>
                <option value="SALES">Sales Representative</option>
                <option value="PURCHASE">Procurement Officer</option>
                <option value="MFG">Manufacturing Lead</option>
                <option value="INVENTORY">Warehouse Manager</option>
              </select>
           </div>
           <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Grant Access</Button>
           </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
