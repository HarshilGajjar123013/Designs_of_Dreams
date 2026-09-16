'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminStore, Customer } from '@/store/adminStore';
import { 
  Search, Eye, FileText, Heart, ShoppingCart, 
  MapPin, Edit, Check, X, Notebook, Plus, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerManagement() {
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<'new' | 'old'>('new');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [duplicateCustomer, setDuplicateCustomer] = useState<any | null>(null);
  const emptyCustomerForm = { name: '', email: '', phone: '', alternatePhone: '', address: '', city: '', state: '', country: 'India', pincode: '', joinedDate: '', purchaseCount: '0', lifetimeValue: '0', notes: '' };
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  
  // Selected Customer detail state
  const [selectedCust, setSelectedCust] = useState<any | null>(null);
  
  // Notes editor state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [custRes, ordsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/orders')
      ]);
      const custData = await custRes.json();
      const ordsData = await ordsRes.json();
      
      if (custData.success) setCustomers(custData.customers);
      if (ordsData.success) setOrders(ordsData.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCust) {
      setNotesText(selectedCust.notes);
      setIsEditingNotes(false);
    }
  }, [selectedCust]);

  if (!mounted) return null;

  const handleSaveNotes = async () => {
    if (!selectedCust) return;
    try {
      const res = await fetch(`/api/customers/${selectedCust.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesText })
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(prev => prev.map(c => c.id === selectedCust.id ? data.customer : c));
        setSelectedCust(data.customer);
        setIsEditingNotes(false);
        alert('Patron preferences updated successfully.');
      } else {
        alert(data.error || 'Failed to update preferences');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving preferences');
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesType = (c.customerType || 'new').toLowerCase() === activeType;
    const query = search.toLowerCase();
    return matchesType && (c.name.toLowerCase().includes(query) || 
           c.email.toLowerCase().includes(query) ||
           c.phone.toLowerCase().includes(query));
  });

  const getCustomerOrders = (customer: any) => {
    return orders.filter(o => o.customerId === customer.id || o.customerName === customer.name);
  };

  const openOldCustomerForm = (customer?: any) => {
    setEditingCustomer(customer || null);
    setCustomerForm(customer ? { ...emptyCustomerForm, ...customer, address: customer.addresses?.[0]?.address || '', joinedDate: String(customer.joinedDate || '').slice(0, 10) } : emptyCustomerForm);
    setDuplicateCustomer(null);
    setShowCustomerForm(true);
  };

  const saveOldCustomer = async (force = false) => {
    const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
    const res = await fetch(url, { method: editingCustomer ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...customerForm, force }) });
    const data = await res.json();
    if (res.status === 409 && data.duplicate) { setDuplicateCustomer(data.duplicate); return; }
    if (!res.ok || !data.success) { alert(data.error || 'Unable to save customer'); return; }
    setShowCustomerForm(false); setDuplicateCustomer(null); await loadData();
  };

  const deleteOldCustomer = async (customer: any) => {
    if (!window.confirm(`Are you sure you want to delete ${customer.name}?`)) return;
    const res = await fetch(`/api/customers/${customer.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Unable to delete customer'); return; }
    if (selectedCust?.id === customer.id) setSelectedCust(null);
    await loadData();
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Patron Directory</h1>
            <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Couture buyers and acquisition profiles</p>
          </div>
          {activeType === 'old' && <button onClick={() => openOldCustomerForm()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6A00] px-4 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#e55f00]"><Plus size={15} /> Add Old Customer</button>}
        </div>

        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          {(['new', 'old'] as const).map(type => <button key={type} onClick={() => { setActiveType(type); setSearch(''); }} className={`rounded-lg px-5 py-2 text-xs font-semibold transition-all ${activeType === type ? 'bg-white text-[#FF6A00] shadow-sm' : 'text-gray-500'}`}>{type === 'new' ? 'New Customers' : 'Old Customers'}</button>)}
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder={`Search ${activeType} customers by Name, Email, or Phone...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3.5 bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] text-xs font-poppins focus:outline-none focus:border-[#FF6A00] shadow-sm"
          />
        </div>

        {/* Directory List */}
        <div className="glass-card rounded-[28px] p-6 shadow-luxury">
          <div className="overflow-x-auto">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Patron</th>
                  <th>Joined Date</th>
                  <th>Purchases count</th>
                  <th>Lifetime Value</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#FF6A00] text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                          {c.avatar && (c.avatar.startsWith('http') || c.avatar.startsWith('data:image')) ? (
                            <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            c.avatar
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{c.name}</p>
                          <p className="text-[10px] text-gray-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-gray-600 font-inter">{c.joinedDate}</td>
                    <td className="font-semibold text-xs text-gray-800 font-inter">{c.totalOrders} Orders</td>
                    <td className="font-semibold text-xs text-gray-900 font-inter">
                      ₹{c.totalSpent.toLocaleString()}
                    </td>
                    <td className="text-xs text-gray-600 font-inter">{c.phone}</td>
                    <td>
                      <button
                        onClick={() => setSelectedCust(c)}
                        className="p-1.5 bg-white border border-gray-200 hover:border-[#FF6A00] rounded-lg text-gray-600 hover:text-[#FF6A00] transition-all flex items-center gap-1.5 text-[10px]"
                      >
                        <Eye size={12} /> Inspect Profile
                      </button>
                      {activeType === 'old' && <div className="mt-2 flex gap-2"><button onClick={() => openOldCustomerForm(c)} className="text-[10px] text-[#FF6A00] hover:underline"><Edit size={11} className="inline mr-1" />Edit</button><button onClick={() => deleteOldCustomer(c)} className="text-[10px] text-red-500 hover:underline"><Trash2 size={11} className="inline mr-1" />Delete</button></div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <AnimatePresence>
          {showCustomerForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: .45 }} exit={{ opacity: 0 }} onClick={() => setShowCustomerForm(false)} className="absolute inset-0 bg-black" />
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-center justify-between"><div><h2 className="font-marcellus text-2xl text-gray-900">{editingCustomer ? 'Edit Old Customer' : 'Add Old Customer'}</h2><p className="mt-1 text-xs text-gray-500">Historical details stay separate from website-acquired customers.</p></div><button onClick={() => setShowCustomerForm(false)} className="text-gray-500"><X /></button></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[['name', 'Full Name *'], ['email', 'Email'], ['phone', 'Phone Number *'], ['alternatePhone', 'Alternate Phone'], ['address', 'Address'], ['city', 'City'], ['state', 'State'], ['country', 'Country'], ['pincode', 'Pincode'], ['joinedDate', 'Customer Since *'], ['purchaseCount', 'Purchases Count'], ['lifetimeValue', 'Lifetime Value (₹)']].map(([name, label]) => <label key={name} className="text-xs font-medium text-gray-600">{label}<input type={name === 'joinedDate' ? 'date' : name === 'purchaseCount' || name === 'lifetimeValue' ? 'number' : 'text'} min={name === 'purchaseCount' || name === 'lifetimeValue' ? 0 : undefined} step={name === 'lifetimeValue' ? '0.01' : undefined} value={(customerForm as any)[name]} onChange={event => setCustomerForm(current => ({ ...current, [name]: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#FF6A00]" /></label>)}
                  <label className="sm:col-span-2 text-xs font-medium text-gray-600">Notes<textarea rows={3} value={customerForm.notes} onChange={event => setCustomerForm(current => ({ ...current, notes: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#FF6A00]" /></label>
                </div>
                {duplicateCustomer && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><strong>This customer may already exist.</strong> {duplicateCustomer.name} ({duplicateCustomer.phone || duplicateCustomer.email})<div className="mt-3 flex gap-3"><button onClick={() => setShowCustomerForm(false)} className="font-semibold">Cancel</button><button onClick={() => { setShowCustomerForm(false); setSelectedCust(duplicateCustomer); }} className="font-semibold">Use Existing Customer</button><button onClick={() => saveOldCustomer(true)} className="font-semibold text-[#FF6A00]">Add Anyway</button></div></div>}
                <div className="mt-6 flex justify-end gap-3"><button onClick={() => setShowCustomerForm(false)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600">Cancel</button><button onClick={() => saveOldCustomer()} className="rounded-xl bg-[#FF6A00] px-4 py-2.5 text-xs font-semibold text-white">{editingCustomer ? 'Save Changes' : 'Add Old Customer'}</button></div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PATRON DETAIL DRAWER */}
        <AnimatePresence>
          {selectedCust && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCust(null)}
                className="absolute inset-0 bg-black"
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-xl bg-white h-full relative shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="h-20 border-b border-gray-100 flex items-center justify-between px-8 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FF6A00] text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                      {selectedCust.avatar && (selectedCust.avatar.startsWith('http') || selectedCust.avatar.startsWith('data:image')) ? (
                        <img src={selectedCust.avatar} alt={selectedCust.name} className="w-full h-full object-cover" />
                      ) : (
                        selectedCust.avatar
                      )}
                    </div>
                    <div>
                      <h3 className="font-marcellus text-lg text-gray-800 uppercase tracking-wider">
                        {selectedCust.name}
                      </h3>
                      <p className="text-[10px] text-gray-500 font-inter">Patron since: {selectedCust.joinedDate}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCust(null)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {/* Preferences / Custom Fitting Notes */}
                  <div className="border border-[rgba(255, 106, 0,0.2)] bg-[#FAF9F6] p-5 rounded-[20px] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-wider flex items-center gap-1.5">
                        <Notebook size={12} /> Custom Preferences & Fitting Notes
                      </span>
                      {!isEditingNotes ? (
                        <button
                          onClick={() => setIsEditingNotes(true)}
                          className="text-[10px] text-[#FF6A00] hover:underline font-semibold"
                        >
                          Edit Notes
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveNotes}
                            className="text-[10px] text-[#0FA958] hover:underline font-semibold flex items-center gap-0.5"
                          >
                            <Check size={10} /> Save
                          </button>
                          <button
                            onClick={() => {
                              setNotesText(selectedCust.notes);
                              setIsEditingNotes(false);
                            }}
                            className="text-[10px] text-red-500 hover:underline font-semibold flex items-center gap-0.5"
                          >
                            <X size={10} /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {isEditingNotes ? (
                      <textarea
                        rows={3}
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00] bg-white"
                      />
                    ) : (
                      <p className="text-xs text-gray-700 leading-relaxed font-poppins italic">
                        "{selectedCust.notes || 'No fitting details specified yet.'}"
                      </p>
                    )}
                  </div>

                  {/* Contact details */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-4 border border-gray-100 rounded-xl">
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Mobile</span>
                      <p className="font-semibold text-gray-800 font-inter">{selectedCust.phone}</p>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-xl">
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Email ID</span>
                      <p className="font-semibold text-gray-800 truncate" title={selectedCust.email}>{selectedCust.email}</p>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-xl">
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Customer Type</span>
                      <p className="font-semibold text-gray-800 capitalize">{selectedCust.customerType || 'new'}</p>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-xl">
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Purchases</span>
                      <p className="font-semibold text-gray-800">{selectedCust.totalOrders} orders · ₹{Number(selectedCust.totalSpent || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Cart and Wishlist overview */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Wishlist */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-wider flex items-center gap-1">
                        <Heart size={10} className="fill-[#FF6A00]" /> Wishlist ({selectedCust.wishlist.length})
                      </h4>
                      {selectedCust.wishlist.length === 0 ? (
                        <p className="text-[10px] text-gray-400">Wishlist empty.</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedCust.wishlist.map((w: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-2 border border-gray-100 rounded-lg text-[10px]">
                              <div className="w-8 h-8 rounded bg-gray-50 overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={w.image} alt={w.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{w.name}</p>
                                <p className="text-gray-400 font-inter">₹{w.price.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cart */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-wider flex items-center gap-1">
                        <ShoppingCart size={10} /> Active Cart ({selectedCust.cart.length})
                      </h4>
                      {selectedCust.cart.length === 0 ? (
                        <p className="text-[10px] text-gray-400">Cart empty.</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedCust.cart.map((c: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-2 border border-gray-100 rounded-lg text-[10px]">
                              <div className="w-8 h-8 rounded bg-gray-50 overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{c.name}</p>
                                <p className="text-gray-400 font-inter">
                                  ₹{c.price.toLocaleString()} x {c.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address List */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1">
                      <MapPin size={11} /> Saved Addresses
                    </h4>
                    <div className="space-y-2">
                      {selectedCust.addresses.map((addr: any, idx: number) => (
                        <div key={idx} className="p-3 border border-gray-100 rounded-xl text-xs">
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                            {addr.type}
                          </span>
                          <p className="text-gray-700 leading-relaxed font-light">{addr.address}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Purchase History */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Purchase History</h4>
                    <div className="space-y-2">
                      {getCustomerOrders(selectedCust).length === 0 ? (
                        <p className="text-[10px] text-gray-400">No purchase history available</p>
                      ) : (
                        getCustomerOrders(selectedCust).map((order) => (
                          <div key={order.id} className="p-3 border border-gray-100 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <p className="font-semibold text-gray-900 font-inter">{order.id}</p>
                              <p className="text-[10px] text-gray-500 font-inter">
                                {new Date(order.createdAt).toLocaleDateString()} | {order.items.length} item(s)
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 font-inter">₹{order.grandTotal.toLocaleString()}</p>
                              <span className="text-[8px] uppercase tracking-wider font-semibold text-[#FF6A00]">
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
