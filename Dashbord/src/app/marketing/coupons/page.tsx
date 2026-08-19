'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminStore } from '@/store/adminStore';
import { Percent, Plus, Tag, RefreshCw, BarChart2, Check, X } from 'lucide-react';

export default function CouponsDesk() {
  const [mounted, setMounted] = useState(false);
  const [couponList, setCouponList] = useState<any[]>([]);
  const [searchTerms, setSearchTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);
  const [newMinOrder, setNewMinOrder] = useState(50000);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (data.success) {
        setCouponList(data.coupons);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadCoupons();
    const store = useAdminStore.getState();
    setSearchTerms(store.searchTerms || []);
  }, []);

  if (!mounted) return null;

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          discountPercent: Number(newDiscount),
          minOrder: Number(newMinOrder)
        })
      });
      const data = await res.json();
      if (data.success) {
        setCouponList([data.coupon, ...couponList]);
        setNewCode('');
        setNewDiscount(10);
        setNewMinOrder(50000);
        alert('Coupon code published to active store channels.');
      } else {
        alert(data.error || 'Failed to create coupon');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating coupon');
    }
  };

  const handleToggleCoupon = async (code: string) => {
    const coupon = couponList.find(c => c.code === code);
    if (!coupon) return;
    
    const targetId = coupon.id || coupon.code;

    try {
      const res = await fetch(`/api/coupons/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !coupon.active })
      });
      const data = await res.json();
      if (data.success) {
        setCouponList(prev => prev.map(c => c.code === code ? data.coupon : c));
      } else {
        alert(data.error || 'Failed to toggle coupon status');
      }
    } catch (err) {
      console.error(err);
      alert('Error toggling coupon status');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5">
          <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Marketing & Search Analytics</h1>
          <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Configure boutique coupons and inspect search conversions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coupon Codes (Col 1 & 2) */}
          <div className="lg:col-span-2 glass-card rounded-[28px] p-6 shadow-luxury space-y-6">
            <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
              <div>
                <h3 className="font-marcellus text-xl text-[#1A1A1A] font-light uppercase tracking-wider">
                  Active Coupon Codes
                </h3>
                <p className="text-[10px] text-[#6E6E6E] uppercase tracking-wider font-inter">Store-wide promotion campaigns</p>
              </div>
              <Tag size={16} className="text-[#FF6A00]" />
            </div>

            <div className="overflow-x-auto">
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Coupon Code</th>
                    <th>Discount (%)</th>
                    <th>Min. Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {couponList.map((c) => (
                    <tr key={c.code}>
                      <td className="font-semibold text-xs text-gray-800 font-inter">{c.code}</td>
                      <td className="font-semibold text-xs text-gray-900 font-inter">{c.discountPercent}% OFF</td>
                      <td className="text-xs text-gray-600 font-inter">₹{c.minOrder.toLocaleString()}</td>
                      <td>
                        <span className={`text-[8.5px] uppercase tracking-widest font-semibold ${
                          c.active ? 'text-[#0FA958]' : 'text-gray-400'
                        }`}>
                          {c.active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleCoupon(c.code)}
                          className={`px-2.5 py-1 rounded-lg border text-[9px] font-semibold transition-all ${
                            c.active
                              ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white'
                              : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white'
                          }`}
                        >
                          {c.active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Coupon Drawer (Col 3) */}
          <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-6 h-fit">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-marcellus text-lg text-gray-800 uppercase tracking-wider font-light flex items-center gap-1.5">
                <Percent size={16} className="text-[#FF6A00]" /> Create Promo Code
              </h3>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. ATELIER25"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00] uppercase"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={99}
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-inter focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Min. Order Value (₹)</label>
                <input
                  type="number"
                  required
                  value={newMinOrder}
                  onChange={(e) => setNewMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-inter focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A1A1A] hover:bg-[#FF6A00] text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus size={12} /> Provision Coupon
              </button>
            </form>
          </div>
        </div>

        {/* Customer Search Queries Analytics */}
        <div className="glass-card rounded-[28px] p-6 shadow-luxury">
          <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-marcellus text-xl text-[#1A1A1A] font-light uppercase tracking-wider">
                Storefront Search Analytics
              </h3>
              <p className="text-[10px] text-[#6E6E6E] uppercase tracking-wider font-inter">Customer Search queries and conversion rates</p>
            </div>
            <BarChart2 size={18} className="text-[#FF6A00]" />
          </div>

          <div className="overflow-x-auto">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Customer Search Keyword</th>
                  <th>Queries Count</th>
                  <th>Conversions</th>
                  <th>Conversion Index (%)</th>
                  <th>Performance Tag</th>
                </tr>
              </thead>
              <tbody>
                {searchTerms.map((s, idx) => {
                  const rate = Math.round((s.conversions / s.count) * 100);
                  return (
                    <tr key={idx}>
                      <td className="font-semibold text-xs text-gray-800 font-poppins">"{s.term}"</td>
                      <td className="font-semibold text-xs text-gray-500 font-inter">{s.count} searches</td>
                      <td className="font-semibold text-xs text-gray-500 font-inter">{s.conversions} conversion(s)</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${rate * 5}%` }} 
                              className="bg-[#FF6A00] h-full"
                            />
                          </div>
                          <span className="font-semibold text-xs text-gray-900 font-inter">{rate}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`text-[8.5px] uppercase tracking-widest font-semibold ${
                          rate > 8 ? 'text-[#0FA958]' : rate > 3 ? 'text-[#FF6A00]' : 'text-[#D99A00]'
                        }`}>
                          {rate > 8 ? 'High Yield' : rate > 3 ? 'Moderate' : 'Low Yield'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
