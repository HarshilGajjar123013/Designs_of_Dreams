'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  ShoppingBag, Search, Download, RefreshCw, MapPin, 
  Phone, Mail, Calendar, Eye, Printer, X, CheckCircle2, 
  Clock, Truck, AlertCircle, ShieldCheck, ChevronRight, User
} from 'lucide-react';
import { printInvoice } from '@/lib/printInvoice';

interface OrderItem {
  productId?: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface CheckoutOrder {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  items?: OrderItem[];
  totalAmount?: number;
  discountAmount?: number;
  gstAmount?: number;
  shippingAmount?: number;
  grandTotal: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    line1?: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    phone: string;
  };
  createdAt: string;
  type?: 'SHOP_ORDER' | 'CONSULTATION';
}

export default function SupportCheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<CheckoutOrder[]>([]);
  const [contactForms, setContactForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ORDERS' | 'CONSULTATIONS'>('ALL');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCheckout, setSelectedCheckout] = useState<any | null>(null);
  const [invoiceCheckout, setInvoiceCheckout] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch Shop Checkout Orders
      const resOrders = await fetch('/api/orders');
      const dataOrders = await resOrders.json();
      const shopOrders: CheckoutOrder[] = (dataOrders.orders || []).map((o: any) => ({
        ...o,
        type: 'SHOP_ORDER'
      }));

      // Fetch Consultation Checkouts
      const resContact = await fetch('/api/contact');
      const dataContact = await resContact.json();
      const contacts = dataContact.contactForms || [];
      setContactForms(contacts);

      setOrders(shopOrders);
    } catch (e) {
      console.error('Failed to load checkout data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  if (!mounted) return null;

  // Combine data depending on activeTab
  const combinedList = [
    ...(activeTab === 'ALL' || activeTab === 'ORDERS' ? orders : []),
    ...(activeTab === 'ALL' || activeTab === 'CONSULTATIONS'
      ? contactForms
          .filter(cf => cf.address || cf.city || cf.state)
          .map(cf => ({
            id: `CONS-${cf.id.slice(0, 8).toUpperCase()}`,
            customerName: cf.name,
            customerEmail: cf.email,
            grandTotal: 0,
            status: cf.status === 'REPLIED' ? 'CONFIRMED' : 'PENDING_REVIEW',
            paymentStatus: 'COMPLIMENTARY',
            paymentMethod: 'ATELIER_BOOKING',
            shippingAddress: {
              line1: cf.address || '',
              city: cf.city || '',
              state: cf.state || '',
              postalCode: cf.pincode || '',
              country: 'India',
              phone: cf.phone || ''
            },
            createdAt: cf.createdAt,
            type: 'CONSULTATION' as const,
            subject: cf.subject,
            message: cf.message
          }))
      : [])
  ];

  // Filtering
  const filteredList = combinedList.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.id.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.customerEmail.toLowerCase().includes(q) ||
      (item.shippingAddress?.phone || '').includes(q) ||
      (item.shippingAddress?.city || '').toLowerCase().includes(q) ||
      (item.shippingAddress?.state || '').toLowerCase().includes(q) ||
      (item.shippingAddress?.postalCode || '').includes(q);

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalCheckouts = combinedList.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const codCount = orders.filter(o => o.paymentMethod === 'COD').length;
  const pendingCount = combinedList.filter(o => o.status === 'PENDING' || o.status === 'PENDING_REVIEW' || o.status === 'UNREAD').length;

  const handleExportCSV = () => {
    if (filteredList.length === 0) return;

    const headers = [
      'Checkout ID', 'Type', 'Customer Name', 'Email', 'Phone',
      'Address', 'City', 'State', 'Pincode', 'Payment Mode',
      'Grand Total (INR)', 'Status', 'Date'
    ];

    const rows = filteredList.map(item => [
      item.id,
      item.type,
      `"${(item.customerName || '').replace(/"/g, '""')}"`,
      item.customerEmail,
      item.shippingAddress?.phone || '',
      `"${(item.shippingAddress?.line1 || '').replace(/"/g, '""')}"`,
      item.shippingAddress?.city || '',
      item.shippingAddress?.state || '',
      item.shippingAddress?.postalCode || '',
      item.paymentMethod,
      item.grandTotal || 0,
      item.status,
      item.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DOD_Shop_Checkout_Data_${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">DOD Shop Check Out Hub</h1>
            <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">
              Live Checkout Orders, Patron Details & Shipping Inquiries from Boutique
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2.5 bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] text-xs font-semibold text-[#6E6E6E] hover:text-[#1A1A1A] hover:border-[#FF6A00] transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#FF6A00] rounded-[16px] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-5 rounded-[24px] border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-poppins">Total Checkouts</span>
              <h3 className="font-marcellus text-2xl text-gray-900 mt-1">{totalCheckouts}</h3>
              <p className="text-[10px] text-gray-500 font-poppins mt-0.5">Across boutique & bookings</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#FF6A00] flex items-center justify-center">
              <ShoppingBag size={22} />
            </div>
          </div>

          <div className="glass-card p-5 rounded-[24px] border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-poppins">Gross Order Value</span>
              <h3 className="font-marcellus text-2xl text-gray-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-green-600 font-poppins mt-0.5">Live store checkouts</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
          </div>

          <div className="glass-card p-5 rounded-[24px] border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-poppins">COD Checkout Orders</span>
              <h3 className="font-marcellus text-2xl text-gray-900 mt-1">{codCount}</h3>
              <p className="text-[10px] text-amber-600 font-poppins mt-0.5">Cash on Delivery mode</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Truck size={22} />
            </div>
          </div>

          <div className="glass-card p-5 rounded-[24px] border border-gray-100 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-poppins">Pending Action</span>
              <h3 className="font-marcellus text-2xl text-gray-900 mt-1">{pendingCount}</h3>
              <p className="text-[10px] text-gray-500 font-poppins mt-0.5">Awaiting dispatch / review</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={22} />
            </div>
          </div>
        </div>

        {/* Source Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'ALL'
                ? 'bg-[#1A1A1A] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-100'
            }`}
          >
            All Checkouts ({totalCheckouts})
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'ORDERS'
                ? 'bg-[#1A1A1A] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-100'
            }`}
          >
            Boutique Product Checkouts ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('CONSULTATIONS')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'CONSULTATIONS'
                ? 'bg-[#1A1A1A] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-100'
            }`}
          >
            Atelier Consultation Checkouts ({contactForms.filter(c => c.address || c.city).length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by ID, Name, Email, Phone, City, State, or Pincode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] text-xs font-poppins focus:outline-none focus:border-[#FF6A00] shadow-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3.5 bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] text-xs font-poppins focus:outline-none focus:border-[#FF6A00] text-gray-700 shadow-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="CONFIRMED">CONFIRMED</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-card rounded-[28px] overflow-hidden border border-gray-100 shadow-luxury">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse luxury-table">
              <thead>
                <tr>
                  <th>Checkout ID</th>
                  <th>Patron</th>
                  <th>Phone</th>
                  <th>Location Destination</th>
                  <th>Payment</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400 text-xs">
                      No checkout entries match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td>
                        <div className="font-semibold text-xs text-gray-900 font-inter">
                          {item.id}
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-poppins">
                          {item.type === 'SHOP_ORDER' ? '🛍️ Shop Order' : '✨ Consultation'}
                        </span>
                      </td>

                      <td>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{item.customerName}</p>
                          <p className="text-[10px] text-gray-500">{item.customerEmail}</p>
                        </div>
                      </td>

                      <td className="text-xs text-gray-700 font-inter">
                        {item.shippingAddress?.phone || '—'}
                      </td>

                      <td>
                        <div className="text-xs text-gray-800">
                          <p className="font-medium truncate max-w-[180px]" title={item.shippingAddress?.line1}>
                            {item.shippingAddress?.line1 || '—'}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {[item.shippingAddress?.city, item.shippingAddress?.state].filter(Boolean).join(', ')}
                            {item.shippingAddress?.postalCode && ` — ${item.shippingAddress?.postalCode}`}
                          </p>
                        </div>
                      </td>

                      <td>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          {item.paymentMethod?.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="text-xs font-bold text-gray-900 font-inter">
                        {item.grandTotal > 0 ? `₹${item.grandTotal.toLocaleString('en-IN')}` : 'Complimentary'}
                      </td>

                      <td>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                          item.status === 'DELIVERED' || item.status === 'CONFIRMED'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : item.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="text-[10px] text-gray-500 font-inter">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>

                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedCheckout(item)}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-[#FF6A00] rounded-lg transition-colors"
                            title="Inspect Checkout Dossier"
                          >
                            <Eye size={15} />
                          </button>
                          {item.type === 'SHOP_ORDER' && (
                            <button
                              onClick={() => setInvoiceCheckout(item)}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-[#FF6A00] rounded-lg transition-colors"
                              title="Print Invoice"
                            >
                              <Printer size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspection Drawer */}
        {selectedCheckout && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-slide-in">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-widest font-poppins">
                    {selectedCheckout.type === 'SHOP_ORDER' ? 'Boutique Order Dossier' : 'Consultation Booking'}
                  </span>
                  <h3 className="font-marcellus text-xl text-gray-900 font-light mt-0.5">
                    {selectedCheckout.id}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCheckout(null)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Patron Information */}
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Patron Information</h4>
                <div className="p-4 border border-gray-100 rounded-xl text-xs space-y-2.5 bg-[#FAF9F6]">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase text-[9px]">Name</span>
                    <span className="font-semibold text-gray-900">{selectedCheckout.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase text-[9px]">Email</span>
                    <span className="text-gray-700">{selectedCheckout.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase text-[9px]">Phone</span>
                    <span className="text-gray-700 font-inter">{selectedCheckout.shippingAddress?.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase text-[9px]">Payment Mode</span>
                    <span className="font-semibold text-gray-900">{selectedCheckout.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Delivery & Residence Address</h4>
                <div className="p-4 border border-gray-100 rounded-xl text-xs space-y-1 bg-white">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-[#FF6A00] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">{selectedCheckout.shippingAddress?.line1 || 'No street specified'}</p>
                      {selectedCheckout.shippingAddress?.line2 && (
                        <p className="text-gray-600">{selectedCheckout.shippingAddress.line2}</p>
                      )}
                      <p className="text-gray-600">
                        {[selectedCheckout.shippingAddress?.city, selectedCheckout.shippingAddress?.state].filter(Boolean).join(', ')}
                        {selectedCheckout.shippingAddress?.postalCode && ` — ${selectedCheckout.shippingAddress.postalCode}`}
                      </p>
                      <p className="text-gray-400 text-[10px]">{selectedCheckout.shippingAddress?.country || 'India'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ordered Items (for shop orders) */}
              {selectedCheckout.items && selectedCheckout.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Purchased Pieces</h4>
                  <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
                    {selectedCheckout.items.map((it: any, i: number) => (
                      <div key={i} className="p-3 flex items-center gap-3 text-xs">
                        {it.image && (
                          <img src={it.image} alt={it.name} className="w-12 h-14 object-cover rounded-lg border" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{it.name}</p>
                          <p className="text-[10px] text-gray-500">
                            {it.size && `Size: ${it.size}`} {it.color && `· Color: ${it.color}`} · Qty: {it.quantity}
                          </p>
                        </div>
                        <span className="font-bold text-gray-900 font-inter">
                          ₹{((it.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial breakdown */}
                  <div className="p-4 border border-gray-100 rounded-xl space-y-1.5 text-xs bg-gray-50/50">
                    <div className="flex justify-between text-gray-600">
                      <span>Total Amount:</span>
                      <span className="font-inter">₹{(selectedCheckout.totalAmount || selectedCheckout.grandTotal).toLocaleString('en-IN')}</span>
                    </div>
                    {selectedCheckout.gstAmount > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>GST:</span>
                        <span className="font-inter">₹{selectedCheckout.gstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5">
                      <span>Grand Total:</span>
                      <span className="font-inter text-[#FF6A00] text-sm">₹{selectedCheckout.grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Consultation Notes */}
              {selectedCheckout.type === 'CONSULTATION' && (
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Inquiry Notes</h4>
                  <div className="p-4 border border-gray-100 rounded-xl text-xs bg-[#FAF9F6] text-gray-700 leading-relaxed italic">
                    "{selectedCheckout.message || 'No custom notes provided.'}"
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {invoiceCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col justify-between max-h-[90vh]">
              {/* Print area */}
              <div id="print-area" className="flex-1 overflow-y-auto space-y-6">
                {/* Invoice Header Bar */}
                <div className="bg-white border-b-2 border-[#FF6A00] p-6 sm:p-8 flex justify-between items-center">
                  <div className="flex items-center gap-3.5">
                    <img src="/logo.png" alt="Designs of Dreams" className="h-11 w-auto object-contain" />
                    <div>
                      <h3 className="font-playfair text-xl sm:text-2xl font-bold text-[#FF6A00] tracking-wide m-0">DESIGNS OF DREAMS</h3>
                      <p className="text-[10px] text-gray-500 font-semibold tracking-[0.15em] uppercase mt-1">HERITAGE ATELIER — TAX INVOICE</p>
                    </div>
                  </div>
                  <div>
                    <span className="inline-block bg-[#FF6A00] text-white text-[10px] font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">TAX INVOICE</span>
                  </div>
                </div>

                {/* Invoice Meta Row */}
                <div className="flex justify-between items-center px-6 sm:px-8 py-4 bg-[#FAF9F6] border-b border-gray-100 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mb-0.5">INVOICE NO.</span>
                    <span className="font-bold text-[#FF6A00] text-sm">INV-{invoiceCheckout.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mb-0.5">ORDER ID</span>
                    <span className="font-bold text-gray-900">{invoiceCheckout.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mb-0.5">DATE</span>
                    <span className="font-semibold text-gray-800">{new Date(invoiceCheckout.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Billing Row */}
                <div className="grid grid-cols-2 gap-6 px-6 sm:px-8 py-4 border-b border-gray-100 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mb-2">BILLED TO</span>
                    <p className="font-bold text-gray-900">{invoiceCheckout.customerName}</p>
                    {invoiceCheckout.customerEmail && <p className="text-gray-500 text-[11px] mt-0.5">{invoiceCheckout.customerEmail}</p>}
                    {invoiceCheckout.shippingAddress?.phone && <p className="text-gray-500 text-[11px]">+91 {invoiceCheckout.shippingAddress.phone}</p>}
                    <p className="text-gray-600 text-[11px] mt-1 leading-relaxed">
                      {[
                        invoiceCheckout.shippingAddress?.line1,
                        invoiceCheckout.shippingAddress?.line2,
                        invoiceCheckout.shippingAddress?.city,
                        invoiceCheckout.shippingAddress?.state,
                        invoiceCheckout.shippingAddress?.postalCode
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mb-2">SOLD BY</span>
                    <p className="font-bold text-gray-900">Designs Of Dreams Pvt. Ltd.</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">Atelier Workshop, Heritage Weave District</p>
                    <p className="text-gray-500 text-[11px]">Varanasi, Uttar Pradesh 221001</p>
                    <p className="text-gray-400 text-[10px] mt-1">GSTIN: 09AABCD1234E1Z5</p>
                  </div>
                </div>

                {/* Items Invoice Table */}
                {invoiceCheckout.items && (
                  <div className="px-6 sm:px-8">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-100 text-gray-400 uppercase tracking-wider font-semibold text-[10px]">
                          <th className="py-3">ITEM DESCRIPTION</th>
                          <th className="py-3 text-center">QTY</th>
                          <th className="py-3 text-right">UNIT PRICE</th>
                          <th className="py-3 text-right">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceCheckout.items.map((it: any, i: number) => (
                          <tr key={i} className="border-b border-gray-100 text-gray-700">
                            <td className="py-3.5 pr-2">
                              <span className="font-semibold text-gray-900 block">{it.name}</span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">{it.sku ? `SKU: ${it.sku}` : ''}</span>
                            </td>
                            <td className="py-3.5 text-center font-inter text-gray-600">{it.quantity}</td>
                            <td className="py-3.5 text-right font-inter text-gray-600">₹{(it.price || 0).toLocaleString('en-IN')}</td>
                            <td className="py-3.5 text-right font-inter font-bold text-gray-900">₹{((it.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Totals */}
                <div className="flex justify-end px-6 sm:px-8">
                  <div className="w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-700">₹{(invoiceCheckout.grandTotal * 0.95).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>GST (5%)</span>
                      <span className="font-semibold text-gray-700">₹{(invoiceCheckout.grandTotal * 0.05).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span className="font-semibold text-gray-700">FREE</span>
                    </div>
                    <div className="border-t border-gray-100 my-1.5" />
                    <div className="flex justify-between text-base font-bold text-gray-900 py-1">
                      <span>Grand Total</span>
                      <span className="text-[#FF6A00]">₹{invoiceCheckout.grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Bar */}
                <div className="mx-6 sm:mx-8 p-4 bg-[#FAF8F4] rounded-xl flex justify-between items-center border border-gray-100 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">PAYMENT METHOD</span>
                    <p className="font-bold text-gray-900 mt-0.5">{invoiceCheckout.paymentMethod || 'COD'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">PAYMENT STATUS</span>
                    <span className="inline-block bg-[#FF6A00]/10 text-[#FF6A00] font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider mt-1">
                      {invoiceCheckout.paymentStatus || 'COMPLETED'}
                    </span>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="px-6 sm:px-8 pb-4 text-center">
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    This is a computer-generated invoice and does not require a physical signature.<br/>
                    For queries contact us at <span className="text-[#FF6A00] font-semibold">support@designsofdreams.in</span>
                  </p>
                </div>
              </div>

              {/* Print button & footer */}
              <div className="border-t border-gray-100 p-4 px-6 sm:px-8 flex justify-between items-center bg-white z-20">
                <span className="text-[10px] text-gray-400">Atelier Print Server v1.0</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setInvoiceCheckout(null)}
                    className="px-5 py-2.5 border border-gray-200 rounded-full text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition-all uppercase tracking-wider"
                  >
                    Close Window
                  </button>
                  <button
                    onClick={() => {
                      printInvoice(invoiceCheckout);
                    }}
                    className="px-6 py-2.5 bg-[#FF6A00] text-white rounded-full text-xs font-bold hover:bg-[#e05d00] transition-all shadow-md flex items-center gap-2 uppercase tracking-wider"
                  >
                    <Printer size={15} /> Send to Printer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
