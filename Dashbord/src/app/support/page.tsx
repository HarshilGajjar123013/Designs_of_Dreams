'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminStore, ContactForm } from '@/store/adminStore';
import {
  Inbox, Send, ArrowRight, Download, Mail,
  Phone, Calendar, CheckSquare, Clock, Search
} from 'lucide-react';

export default function SupportDesk() {
  const [mounted, setMounted] = useState(false);
  const [contactForms, setContactForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREAD' | 'REPLIED'>('ALL');

  // Selected Message
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // Reply composer
  const [replyText, setReplyText] = useState('');

  const loadContactForms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      if (data.success) {
        setContactForms(data.contactForms);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadContactForms();
  }, []);

  // Update selected ticket details if it gets updated in contactForms
  useEffect(() => {
    if (selectedTicket) {
      const updated = contactForms.find(cf => cf.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [contactForms]);

  if (!mounted) return null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      const res = await fetch(`/api/contact/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText.trim(), status: 'REPLIED' })
      });
      const data = await res.json();
      if (data.success) {
        setContactForms(prev => prev.map(cf => cf.id === selectedTicket.id ? data.contactForm : cf));
        setReplyText('');
        alert('Reply processed and marked as sent.');
      } else {
        alert(data.error || 'Failed to send reply');
      }
    } catch (err) {
      console.error(err);
      alert('Error sending reply');
    }
  };

  const handleExportCSV = () => {
    if (contactForms.length === 0) return;

    // Build CSV Headers & Rows
    const headers = ['Ticket ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Reply Text', 'Replied At', 'Created At'];

    const rows = contactForms.map(cf => [
      cf.id,
      `"${cf.name.replace(/"/g, '""')}"`,
      cf.email,
      cf.phone,
      `"${cf.subject.replace(/"/g, '""')}"`,
      `"${cf.message.replace(/"/g, '""')}"`,
      cf.status,
      cf.reply ? `"${cf.reply.replace(/"/g, '""')}"` : '',
      cf.repliedAt || '',
      cf.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Create Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DOD_Atelier_Support_Tickets_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTickets = contactForms.filter((cf) => {
    const matchesSearch = cf.name.toLowerCase().includes(search.toLowerCase()) ||
      cf.subject.toLowerCase().includes(search.toLowerCase()) ||
      cf.message.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || cf.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-5">
          <div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Atelier Support Inbox</h1>
            <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Artisanal consultations and inquiries</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] text-xs font-semibold text-[#6E6E6E] hover:text-[#1A1A1A] hover:border-[#FF6A00] transition-all flex items-center gap-2 shadow-sm"
          >
            <Download size={14} /> Export Tickets (CSV)
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by sender, subject, or message keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] text-xs font-poppins focus:outline-none focus:border-[#FF6A00] shadow-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3.5 bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] text-xs font-poppins focus:outline-none focus:border-[#FF6A00] text-gray-700 shadow-sm"
            >
              <option value="ALL">All Enquiries</option>
              <option value="UNREAD">Unread / Unanswered</option>
              <option value="REPLIED">Replied</option>
            </select>
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">
          {/* Messages list (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="glass-card rounded-[28px] p-12 text-center text-gray-500 border border-gray-100 flex flex-col items-center">
                <Inbox size={48} className="text-gray-300 mb-4 stroke-[1.5]" />
                <p className="font-marcellus text-lg font-light text-gray-800">Support Inbox Empty</p>
                <p className="text-xs text-gray-400 mt-1 font-poppins">All client requests have been cleared.</p>
              </div>
            ) : (
              filteredTickets.map((cf) => (
                <div
                  key={cf.id}
                  onClick={() => setSelectedTicket(cf)}
                  className={`p-5 rounded-[24px] border transition-all cursor-pointer flex flex-col justify-between h-[150px] ${selectedTicket?.id === cf.id
                      ? 'bg-white border-[#FF6A00] shadow-luxury'
                      : 'bg-white hover:bg-gray-50 border-[rgba(0,0,0,0.03)] shadow-sm'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[8px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded border ${cf.status === 'UNREAD'
                          ? 'bg-amber-50 text-[#D99A00] border-[rgba(217,154,0,0.15)] animate-pulse'
                          : 'bg-green-50 text-[#0FA958] border-[rgba(15,169,88,0.15)]'
                        }`}>
                        {cf.status}
                      </span>
                      <h4 className="font-marcellus text-base text-gray-900 font-light mt-2">
                        {cf.subject}
                      </h4>
                    </div>
                    <span className="text-[10px] text-gray-400 font-inter">
                      {new Date(cf.createdAt).toLocaleDateString('en-IN', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 font-light line-clamp-2 mt-2 leading-relaxed">
                    {cf.message}
                  </p>

                  <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-50 pt-2 mt-2 font-poppins">
                    <span>Sender: <strong>{cf.name}</strong> ({cf.email})</span>
                    <span className="text-[#FF6A00] font-semibold flex items-center gap-0.5">
                      Inspect Request <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ticket Detail Sidebar Pane (Col 3) */}
          <div className="glass-card rounded-[28px] p-6 shadow-luxury flex flex-col justify-between min-h-[500px]">
            {selectedTicket ? (
              <div className="flex flex-col justify-between h-full space-y-6">
                <div className="space-y-4">
                  {/* Sender Dossier */}
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="font-marcellus text-lg text-gray-900 font-light uppercase tracking-wider">
                      Sender Dossier
                    </h3>
                    <div className="mt-3 text-xs space-y-2">
                      <p className="flex items-center gap-2 text-gray-700">
                        <Mail size={13} className="text-gray-400" />
                        <strong>{selectedTicket.name}</strong>
                      </p>
                      <p className="text-gray-500 pl-5">{selectedTicket.email}</p>
                      <p className="flex items-center gap-2 text-gray-700 pl-0.5">
                        <Phone size={13} className="text-gray-400" />
                        {selectedTicket.phone}
                      </p>
                      <p className="flex items-center gap-2 text-gray-500 pl-0.5">
                        <Calendar size={13} className="text-gray-400" />
                        Sent: {new Date(selectedTicket.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Inquiry details</span>
                    <div className="p-4 border border-gray-100 rounded-xl bg-[#FAF9F6] text-xs leading-relaxed text-gray-700 font-poppins">
                      {selectedTicket.message}
                    </div>
                  </div>

                  {/* Existing Reply info */}
                  {selectedTicket.status === 'REPLIED' && selectedTicket.reply && (
                    <div className="space-y-2 border-t border-gray-100 pt-4">
                      <span className="text-[9px] uppercase font-bold text-[#0FA958] tracking-wider block">Sent Reply Archive</span>
                      <div className="p-4 border border-green-100 rounded-xl bg-green-50/30 text-xs leading-relaxed text-gray-700 font-poppins italic">
                        "{selectedTicket.reply}"
                      </div>
                      {selectedTicket.repliedAt && (
                        <p className="text-[9px] text-gray-400 font-inter">Replied at: {new Date(selectedTicket.repliedAt).toLocaleString()}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Reply Composer Form */}
                {selectedTicket.status === 'UNREAD' && (
                  <form onSubmit={handleSendReply} className="space-y-3 border-t border-gray-100 pt-4 bg-white">
                    <span className="text-[9px] uppercase font-bold text-[#FF6A00] tracking-wider block">Compose Atelier Reply</span>
                    <textarea
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Dear client, Thank you for writing to Designs of Dreams..."
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#1A1A1A] hover:bg-[#FF6A00] text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Send size={12} /> Send Response
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <Mail size={32} className="text-gray-200 mb-3 stroke-[1.5]" />
                <p className="text-xs font-semibold text-gray-700">Select an Inquiry</p>
                <p className="text-[9px] text-gray-500 mt-0.5">Click any ticket in the inbox to inspect sender metadata and send an official response.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
