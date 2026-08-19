'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminStore } from '@/store/adminStore';
import { Sliders, Save, Shield, User, Globe, Key, Camera } from 'lucide-react';

export default function SettingsPanel() {
  const [mounted, setMounted] = useState(false);
  const { currentAdmin, setCredentials, role, toggleRole } = useAdminStore();
  const [storeName, setStoreName] = useState('Designs of Dreams');
  const [supportEmail, setSupportEmail] = useState('concierge@designsofdreams.in');
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('IST (UTC+05:30)');

  // Profile Edit Form State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminAvatar, setAdminAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentAdmin) {
      setAdminName(currentAdmin.name || '');
      setAdminEmail(currentAdmin.email || '');
      setAdminAvatar(currentAdmin.avatar || '');
    }
  }, [currentAdmin]);

  if (!mounted) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Atelier operational settings saved successfully.');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin || !currentAdmin.id) return;
    setSavingProfile(true);

    try {
      const res = await fetch(`/api/admins/${currentAdmin.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': role,
          'x-user-id': currentAdmin.id
        },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          avatar: adminAvatar
        })
      });
      const data = await res.json();
      if (data.success) {
        setCredentials(data.admin, data.admin.role);
        alert('Operator profile details updated successfully.');
      } else {
        alert(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating operator profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-5">
          <div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Atelier Settings</h1>
            <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Configure global store preferences and user profiles</p>
          </div>
          <button
            onClick={handleSaveSettings}
            className="px-5 py-3 bg-[#1A1A1A] text-white rounded-[16px] text-xs font-semibold hover:bg-[#FF6A00] transition-all flex items-center gap-2 shadow-md uppercase tracking-wider"
          >
            <Save size={14} /> Save Settings
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form details (Col 1 & 2) */}
          <form onSubmit={handleSaveSettings} className="lg:col-span-2 space-y-6">
            {/* General store settings */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-4">
              <h3 className="font-marcellus text-lg text-gray-800 uppercase tracking-wider flex items-center gap-2 font-light">
                <Globe size={18} className="text-[#FF6A00]" /> Boutique Configurations
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Store Brand Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Support Email</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">System Currency</label>
                  <input
                    type="text"
                    value={currency}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-inter bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Operational Timezone</label>
                  <input
                    type="text"
                    value={timezone}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-inter bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* API Keys */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-4">
              <h3 className="font-marcellus text-lg text-gray-800 uppercase tracking-wider flex items-center gap-2 font-light">
                <Key size={18} className="text-[#FF6A00]" /> Integrations & API Credentials
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Cloudinary Cloud Name</label>
                  <input
                    type="text"
                    value="design-of-dreams-luxury"
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-poppins bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Prisma PostgreSQL Database URL</label>
                  <input
                    type="password"
                    value="postgresql://atelier_admin:••••••••••••@localhost:5432/dod_atelier"
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-inter bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Profile Sidebar Info (Col 3) */}
          <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-widest">Operator Profile</span>
              <h3 className="font-marcellus text-xl text-[#1A1A1A] mt-1 font-light uppercase tracking-wider">
                Session Dossier
              </h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex flex-col items-center py-2 text-center space-y-3 relative group">
                <div 
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-16 h-16 rounded-full bg-[#FF6A00] text-white flex items-center justify-center font-semibold text-xl shadow-md overflow-hidden cursor-pointer relative"
                >
                  {adminAvatar && (adminAvatar.startsWith('http') || adminAvatar.startsWith('data:image')) ? (
                    <img src={adminAvatar} alt={adminName} className="w-full h-full object-cover" />
                  ) : (
                    adminAvatar || (adminName ? adminName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'A')
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-[9px] uppercase font-bold">
                    Change
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="space-y-3 text-left">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Operator Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Operator Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Level Privilege</label>
                  <input
                    type="text"
                    value={role.replace('_', ' ')}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-400 rounded-xl text-xs font-poppins cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full bg-[#1A1A1A] hover:bg-[#FF6A00] text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                {savingProfile ? 'Saving...' : 'Update Operator Profile'}
              </button>
            </form>

            {/* Quick role toggle */}
            <div className="border-t border-gray-100 pt-6 space-y-3 text-center">
              <p className="text-[11px] text-gray-500 leading-relaxed font-poppins">
                You can toggle roles instantly below to experience the differences in catalog administration privilege rights.
              </p>
              <button
                onClick={toggleRole}
                className="w-full bg-[#1A1A1A] hover:bg-[#FF6A00] text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Shield size={12} /> Toggle Operator Role
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
