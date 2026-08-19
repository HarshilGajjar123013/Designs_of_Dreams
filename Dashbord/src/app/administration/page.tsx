'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Shield, Plus, Power, Check, X, ShieldAlert, Lock, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminManagement() {
  const [mounted, setMounted] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New Admin form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'MANAGER'>('MANAGER');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    setMounted(true);
    const fetchAdmins = async () => {
      try {
        const res = await fetch('/api/admins');
        const data = await res.json();
        if (data.success) {
          setAdmins(data.admins);
        }
      } catch (err) {
        console.error('Failed to fetch admins:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  if (!mounted || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF6A00]"></div>
        </div>
      </AdminLayout>
    );
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
          avatar
        })
      });
      const data = await res.json();
      if (data.success) {
        setAdmins(prev => [...prev, data.admin]);
        setName('');
        setEmail('');
        setPassword('');
        setRole('MANAGER');
        setAvatar('');
        setModalOpen(false);
        alert('New administrator profile provisioned successfully.');
      } else {
        alert(data.error || 'Failed to provision administrator');
      }
    } catch (err) {
      console.error(err);
      alert('Error provisioning administrator');
    }
  };

  const handleToggleStatus = async (admin: any) => {
    if (admin.role === 'SUPER_ADMIN') {
      alert('Super Administrator status cannot be toggled.');
      return;
    }
    const nextStatus = admin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admins/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setAdmins(prev => prev.map(a => a.id === admin.id ? data.admin : a));
      } else {
        alert(data.error || 'Failed to update administrator status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-5">
          <div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Admin & Role Management</h1>
            <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Configure administrator directory and authorization parameters</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 bg-[#1A1A1A] text-white rounded-[16px] text-xs font-semibold hover:bg-[#FF6A00] transition-all flex items-center gap-2 shadow-md uppercase tracking-wider"
          >
            <UserPlus size={14} /> Provision Admin
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Directory (Col 1 & 2) */}
          <div className="lg:col-span-2 glass-card rounded-[28px] p-6 shadow-luxury">
            <div className="border-b border-gray-100 pb-4 mb-4">
              <h3 className="font-marcellus text-xl text-[#1A1A1A] font-light uppercase tracking-wider">
                Atelier Administrator Directory
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Email ID</th>
                    <th>Role Assigned</th>
                    <th>Last Active</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((adm) => (
                    <tr key={adm.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-[10px] overflow-hidden shadow-sm">
                            {adm.avatar && (adm.avatar.startsWith('http') || adm.avatar.startsWith('data:image')) ? (
                              <img src={adm.avatar} alt={adm.name} className="w-full h-full object-cover" />
                            ) : (
                              adm.avatar
                            )}
                          </div>
                          <span className="text-xs font-semibold text-gray-900">{adm.name}</span>
                        </div>
                      </td>
                      <td className="text-xs text-gray-500 font-inter">{adm.email}</td>
                      <td>
                        <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                          adm.role === 'SUPER_ADMIN' ? 'bg-[rgba(255, 106, 0,0.1)] text-[#FF6A00]' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {adm.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-xs text-gray-600 font-inter">{adm.lastLogin}</td>
                      <td>
                        <span className={`text-[9px] uppercase tracking-widest font-semibold ${
                          adm.status === 'ACTIVE' ? 'text-[#0FA958]' : 'text-red-500'
                        }`}>
                          {adm.status}
                        </span>
                      </td>
                      <td>
                        {adm.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleToggleStatus(adm)}
                            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[9px] font-semibold ${
                              adm.status === 'ACTIVE'
                                ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white'
                                : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white'
                            }`}
                          >
                            <Power size={10} /> {adm.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permission Matrix Sidebar (Col 3) */}
          <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-widest">Authorization</span>
              <h3 className="font-marcellus text-xl text-[#1A1A1A] mt-1 font-light uppercase tracking-wider">
                Permission Matrix
              </h3>
            </div>

            <div className="space-y-4 text-xs font-poppins">
              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="bg-[#FAF9F6] border-b border-gray-100 p-3 flex justify-between font-semibold uppercase text-[9px] tracking-wider text-gray-500">
                  <span>Dashboard Feature Area</span>
                  <div className="flex gap-6 w-24 justify-between pr-2">
                    <span>Admin</span>
                    <span>Mgr</span>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-50">
                  <div className="p-3 flex justify-between items-center text-[11px]">
                    <span className="text-gray-700">Financial Revenue Analytics</span>
                    <div className="flex gap-6 w-24 justify-between text-center pr-3">
                      <Check size={14} className="text-[#0FA958] mx-auto" />
                      <X size={14} className="text-red-500 mx-auto" />
                    </div>
                  </div>
                  <div className="p-3 flex justify-between items-center text-[11px]">
                    <span className="text-gray-700">Product Management CRUD</span>
                    <div className="flex gap-6 w-24 justify-between text-center pr-3">
                      <Check size={14} className="text-[#0FA958] mx-auto" />
                      <Check size={14} className="text-[#0FA958] mx-auto" />
                    </div>
                  </div>
                  <div className="p-3 flex justify-between items-center text-[11px]">
                    <span className="text-gray-700">Fulfill Orders & Logistics</span>
                    <div className="flex gap-6 w-24 justify-between text-center pr-3">
                      <Check size={14} className="text-[#0FA958] mx-auto" />
                      <Check size={14} className="text-[#0FA958] mx-auto" />
                    </div>
                  </div>
                  <div className="p-3 flex justify-between items-center text-[11px]">
                    <span className="text-gray-700">User Banners & CMS</span>
                    <div className="flex gap-6 w-24 justify-between text-center pr-3">
                      <Check size={14} className="text-[#0FA958] mx-auto" />
                      <X size={14} className="text-red-500 mx-auto" />
                    </div>
                  </div>
                  <div className="p-3 flex justify-between items-center text-[11px]">
                    <span className="text-gray-700">Admin Account Management</span>
                    <div className="flex gap-6 w-24 justify-between text-center pr-3">
                      <Check size={14} className="text-[#0FA958] mx-auto" />
                      <X size={14} className="text-red-500 mx-auto" />
                    </div>
                  </div>
                  <div className="p-3 flex justify-between items-center text-[11px]">
                    <span className="text-gray-700">Security Audit logs</span>
                    <div className="flex gap-6 w-24 justify-between text-center pr-3">
                      <Check size={14} className="text-[#0FA958] mx-auto" />
                      <X size={14} className="text-red-500 mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PROVISIONING MODAL */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalOpen(false)}
                className="absolute inset-0 bg-black"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 p-8 space-y-6"
              >
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-marcellus text-xl text-gray-800 uppercase tracking-wider font-light flex items-center gap-2">
                    <Shield size={18} className="text-[#FF6A00]" /> Provision Admin Account
                  </h3>
                  <p className="text-[10px] text-gray-400 font-poppins mt-1">Define credentials and restrict system access privileges</p>
                </div>

                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="flex flex-col items-center py-2 text-center space-y-2 relative group">
                    <div 
                      onClick={() => document.getElementById('new-admin-avatar')?.click()}
                      className="w-16 h-16 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-semibold text-xl shadow-md overflow-hidden cursor-pointer relative"
                    >
                      {avatar ? (
                        <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'A'
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-[9px] uppercase font-bold">
                        Upload
                      </div>
                    </div>
                    <input 
                      type="file" 
                      id="new-admin-avatar" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert("File size exceeds 2MB limit!");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setAvatar(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <span className="text-[10px] text-gray-400 font-poppins">Click to upload avatar (Optional)</span>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rohini Sen"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Email ID Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@designsofdreams.in"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Temporary Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Authorization Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'SUPER_ADMIN' | 'MANAGER')}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00] bg-white text-gray-700 font-medium"
                    >
                      <option value="MANAGER">MANAGER (Restricted Catalog/Orders)</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Full Command Access)</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-xs font-semibold hover:bg-[#FF6A00] transition-all shadow-md uppercase tracking-wider"
                    >
                      Create Profile
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
