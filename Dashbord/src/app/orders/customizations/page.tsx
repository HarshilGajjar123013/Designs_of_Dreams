'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Sparkles, Search, Loader2, User, Mail, Phone, Clock,
  Layers, Palette, Tag, Scissors, ExternalLink, Filter
} from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'IN_REVIEW', 'APPROVED', 'COMPLETED', 'CANCELLED'] as const;

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  IN_REVIEW: 'bg-blue-100 text-blue-800 border-blue-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  COMPLETED: 'bg-gray-100 text-gray-700 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

function formatDate(value: string | Date) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderCustomizationsPage() {
  const [mounted, setMounted] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>('ALL');
  const [selected, setSelected] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customizations');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadRequests();
  }, []);

  useEffect(() => {
    if (selected) {
      const updated = requests.find((r) => r.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [requests, selected?.id]);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        r.customerName?.toLowerCase().includes(q) ||
        r.customerEmail?.toLowerCase().includes(q) ||
        r.product?.name?.toLowerCase().includes(q) ||
        r.product?.sku?.toLowerCase().includes(q) ||
        r.fabric?.toLowerCase().includes(q) ||
        r.color?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/customizations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.map((r) => (r.id === id ? data.request : r)));
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!mounted) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-luxury-gold" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-luxury-gold font-bold font-inter">
                Storefront · dodshop
              </span>
            </div>
            <h1 className="font-marcellus text-3xl font-light text-gray-900">Customer Customizations</h1>
            <p className="text-xs text-gray-500 font-poppins mt-1">
              Bespoke weave requests submitted by customers on the website product pages.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-inter block">Total Requests</span>
            <span className="text-2xl font-bold text-gray-900 font-inter">{requests.length}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by customer, product, fabric, color..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-border-lux rounded-2xl text-xs font-poppins focus:outline-none focus:border-luxury-gold shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as (typeof STATUS_OPTIONS)[number])}
              className="px-4 py-3.5 bg-white border border-border-lux rounded-2xl text-xs font-poppins focus:outline-none focus:border-luxury-gold text-gray-700 shadow-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={36} className="animate-spin text-luxury-gold" />
            <span className="text-xs text-gray-400 font-poppins uppercase tracking-widest">Loading customization requests...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-border-lux rounded-3xl">
            <Sparkles size={40} className="text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-800">No customization requests yet</p>
            <p className="text-xs text-gray-500 mt-1">When customers submit bespoke requests from dodshop product pages, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {filtered.map((req) => (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => setSelected(req)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    selected?.id === req.id
                      ? 'border-luxury-gold bg-amber-50/50 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-luxury-gold/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{req.product?.name || 'Unknown Product'}</p>
                      <p className="text-[10px] text-gray-400 font-inter">{req.product?.sku}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[req.status] || STATUS_STYLES.PENDING}`}>
                      {req.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 font-poppins truncate">
                    {req.customerName || 'Guest'} · {req.fabric} · {req.color}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatDate(req.createdAt)}</p>
                </button>
              ))}
            </div>

            <div className="xl:col-span-2">
              {selected ? (
                <div className="bg-white border border-border-lux rounded-3xl p-6 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex gap-4">
                      {selected.product?.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selected.product.images[0]}
                          alt={selected.product.name}
                          className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                        />
                      )}
                      <div>
                        <h2 className="font-marcellus text-xl text-gray-900">{selected.product?.name || 'Product'}</h2>
                        <p className="text-xs text-gray-400 font-inter">{selected.product?.sku}</p>
                        <Link
                          href="/catalog/products"
                          className="inline-flex items-center gap-1 text-[10px] text-luxury-gold font-semibold mt-1 hover:underline"
                        >
                          View in Catalog <ExternalLink size={10} />
                        </Link>
                      </div>
                    </div>
                    <select
                      value={selected.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleStatusChange(selected.id, e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-luxury-gold bg-white"
                    >
                      {STATUS_OPTIONS.filter((s) => s !== 'ALL').map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailItem icon={User} label="Customer" value={selected.customerName || 'Guest'} />
                    <DetailItem icon={Mail} label="Email" value={selected.customerEmail || '—'} />
                    <DetailItem icon={Phone} label="Phone" value={selected.customerPhone || '—'} />
                    <DetailItem icon={Clock} label="Submitted" value={formatDate(selected.createdAt)} />
                    <DetailItem icon={Layers} label="Fabric" value={selected.fabric} />
                    <DetailItem icon={Palette} label="Color" value={selected.color} />
                    <DetailItem icon={Tag} label="Budget" value={selected.budget} />
                    <DetailItem icon={Scissors} label="Aemroduri" value={selected.aemroduriType} />
                    <DetailItem icon={Sparkles} label="Tassels" value={selected.tassels} />
                    <DetailItem icon={Clock} label="Time Estimate" value={`${selected.timeEstimateMonths} months`} />
                  </div>

                  {selected.notes && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 font-inter">Special Notes</p>
                      <p className="text-sm text-gray-700 font-poppins whitespace-pre-wrap">{selected.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[320px]">
                  <Sparkles size={32} className="text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 font-poppins">Select a request to view full customization details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} className="text-luxury-gold" />
        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-inter">{label}</span>
      </div>
      <p className="text-xs font-semibold text-gray-800 font-poppins">{value}</p>
    </div>
  );
}
