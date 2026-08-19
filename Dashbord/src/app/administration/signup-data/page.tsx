'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { UserCheck, Users, Shield, Calendar, ShieldCheck, Mail, Phone, Image as ImageIcon } from 'lucide-react';

export default function SignUpDataPanel() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'customers' | 'admins'>('customers');
  const [customers, setCustomers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const [custRes, adminRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/admins')
        ]);
        const custData = await custRes.json();
        const adminData = await adminRes.json();

        if (custData.success) {
          setCustomers(custData.customers);
        }
        if (adminData.success) {
          setAdmins(adminData.admins);
        }
      } catch (err) {
        console.error('Failed to fetch sign up data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5">
          <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Sign Up Database</h1>
          <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Directory of registered storefront clients and provisioned administrators</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-gray-100 pb-px">
          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-4 px-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'customers'
                ? 'border-[#FF6A00] text-[#FF6A00]'
                : 'border-transparent text-[#6E6E6E] hover:text-[#1A1A1A]'
            }`}
          >
            <Users size={14} /> Storefront Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`pb-4 px-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'admins'
                ? 'border-[#FF6A00] text-[#FF6A00]'
                : 'border-transparent text-[#6E6E6E] hover:text-[#1A1A1A]'
            }`}
          >
            <Shield size={14} /> Command Operators ({admins.length})
          </button>
        </div>

        {/* Data Presentation */}
        <div className="glass-card rounded-[28px] p-6 shadow-luxury">
          <div className="overflow-x-auto">
            {activeTab === 'customers' ? (
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Contact Phone</th>
                    <th>Joined Date</th>
                    <th>Verification</th>
                    <th>Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-gray-50/50 transition-all">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-xs overflow-hidden shadow-inner border border-gray-100">
                            {cust.avatar && (cust.avatar.startsWith('http') || cust.avatar.startsWith('data:image')) ? (
                              <img src={cust.avatar} alt={cust.name} className="w-full h-full object-cover" />
                            ) : (
                              cust.avatar || cust.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-900 block">{cust.name}</span>
                            <span className="text-[9px] text-gray-400 font-mono">ID: {cust.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-gray-600 font-inter">
                        <div className="flex items-center gap-1.5">
                          <Mail size={11} className="text-gray-400" />
                          <span>{cust.email}</span>
                        </div>
                      </td>
                      <td className="text-xs text-gray-600 font-inter">
                        {cust.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone size={11} className="text-gray-400" />
                            <span>{cust.phone}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-light italic">None provided</span>
                        )}
                      </td>
                      <td className="text-xs text-gray-600 font-inter">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-gray-400" />
                          <span>{cust.joinedDate}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${
                          cust.isVerified !== false
                            ? 'bg-green-50 text-[#0FA958] border-[rgba(15,169,88,0.15)]'
                            : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                        }`}>
                          {cust.isVerified !== false ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="text-xs font-semibold text-gray-900 font-inter">
                        ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400 text-xs font-poppins italic">
                        No customer registrations recorded in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Operator Name</th>
                    <th>Email Address</th>
                    <th>Security Privilege</th>
                    <th>Created On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-gray-50/50 transition-all">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#FF6A00] text-white flex items-center justify-center font-bold text-xs overflow-hidden shadow-inner border border-gray-100">
                            {adm.avatar && (adm.avatar.startsWith('http') || adm.avatar.startsWith('data:image')) ? (
                              <img src={adm.avatar} alt={adm.name} className="w-full h-full object-cover" />
                            ) : (
                              adm.avatar || adm.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-900 block">{adm.name}</span>
                            <span className="text-[9px] text-gray-400 font-mono">ID: {adm.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-gray-600 font-inter">
                        <div className="flex items-center gap-1.5">
                          <Mail size={11} className="text-gray-400" />
                          <span>{adm.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                          adm.role === 'SUPER_ADMIN' ? 'bg-[rgba(255, 106, 0,0.1)] text-[#FF6A00]' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {adm.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-xs text-gray-600 font-inter">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-gray-400" />
                          <span>{adm.createdAt ? new Date(adm.createdAt).toISOString().split('T')[0] : 'Pre-seeded'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`text-[8.5px] uppercase tracking-widest font-bold ${
                          adm.status === 'ACTIVE' ? 'text-[#0FA958]' : 'text-red-500'
                        }`}>
                          {adm.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-400 text-xs font-poppins italic">
                        No administrator provisions recorded in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
