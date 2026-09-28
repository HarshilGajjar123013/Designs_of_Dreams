'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Mail,
  Phone,
  Eye,
  RefreshCw,
  Globe,
  Sparkles,
  Link as LinkIcon,
  Plus,
  Trash2,
  MoveUp,
  MoveDown
} from 'lucide-react';

const DEFAULT_PRESETS = [
  'FREE SHIPPING ON ALL ORDERS ABOVE ₹1999',
  'HANDCRAFTED WITH LOVE IN INDIA',
  'NEW FESTIVE COLLECTION OUT NOW!',
  'COMPLIMENTARY BLOUSE STITCHING ON BRIDAL ORDERS',
  'EXCLUSIVE 15% OFF FOR NEW CLIENTS — USE CODE: FIRST15'
];

function parseAnnouncements(raw?: string | null): string[] {
  if (!raw || !raw.trim()) return ['FREE SHIPPING ON ALL ORDERS ABOVE ₹1999'];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((s) => String(s).trim()).filter((s) => s.length > 0);
    }
  } catch {}
  const lines = raw.split(/\r?\n/).map((s) => s.trim()).filter((s) => s.length > 0);
  return lines.length > 0 ? lines : ['FREE SHIPPING ON ALL ORDERS ABOVE ₹1999'];
}

export default function AnnouncementBarManagement() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cms, setCms] = useState<any>(null);

  // Form State: array of multiple announcements
  const [announcements, setAnnouncements] = useState<string[]>([
    'FREE SHIPPING ON ALL ORDERS ABOVE ₹1999'
  ]);
  const [announcementLink, setAnnouncementLink] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(true);

  // Live preview rotation index
  const [previewIndex, setPreviewIndex] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchCmsData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.cms) {
        setCms(data.cms);
        const parsedList = parseAnnouncements(data.cms.announcementText);
        setAnnouncements(parsedList);
        setAnnouncementLink(data.cms.announcementLink || '');
        setAnnouncementActive(data.cms.announcementActive ?? true);
      }
    } catch (err) {
      console.error('Failed to fetch CMS announcement:', err);
      showToast('error', 'Failed to retrieve announcement bar settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchCmsData();
  }, []);

  // Rotate preview if multiple announcements
  useEffect(() => {
    const validCount = announcements.filter((s) => s.trim().length > 0).length;
    if (validCount <= 1) {
      setPreviewIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setPreviewIndex((p) => (p + 1) % validCount);
    }, 3500);
    return () => clearInterval(interval);
  }, [announcements]);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveAnnouncement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [announcements, announcementLink, announcementActive, cms]);

  const handleUpdateItem = (index: number, text: string) => {
    setAnnouncements((prev) => {
      const copy = [...prev];
      copy[index] = text;
      return copy;
    });
  };

  const handleAddItem = () => {
    setAnnouncements((prev) => [...prev, '']);
  };

  const handleRemoveItem = (index: number) => {
    setAnnouncements((prev) => {
      if (prev.length <= 1) {
        return [''];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    setAnnouncements((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleApplyPreset = (preset: string) => {
    if (announcements.includes(preset)) return;
    if (announcements.length === 1 && !announcements[0].trim()) {
      setAnnouncements([preset]);
    } else {
      setAnnouncements((prev) => [...prev, preset]);
    }
  };

  const handleSaveAnnouncement = async () => {
    setIsSaving(true);
    try {
      const currentCms = cms || {};
      const cleanAnnouncements = announcements
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const finalPayload = cleanAnnouncements.length > 0
        ? cleanAnnouncements.join('\n')
        : 'FREE SHIPPING ON ALL ORDERS ABOVE ₹1999';

      const res = await fetch('/api/cms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentCms,
          announcementText: finalPayload,
          announcementLink: announcementLink.trim(),
          announcementActive,
        })
      });
      const data = await res.json();
      if (data.success) {
        setCms(data.cms);
        showToast('success', 'Announcements updated! Live on storefront.');
      } else {
        throw new Error(data.error || 'Failed to save announcements');
      }
    } catch (err: any) {
      console.error('Save announcement error:', err);
      showToast('error', err.message || 'Failed to save announcements');
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-[#FF6A00]"></div>
          <p className="text-xs font-poppins text-gray-400 uppercase tracking-widest">Loading Announcements...</p>
        </div>
      </AdminLayout>
    );
  }

  const validAnnouncements = announcements.filter((s) => s.trim().length > 0);
  const currentPreviewText = validAnnouncements[previewIndex] || validAnnouncements[0] || 'FREE SHIPPING ON ALL ORDERS ABOVE ₹1999';

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in font-poppins pb-16">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl text-xs font-semibold shadow-2xl flex items-center gap-3 transition-all duration-300 animate-slide-up ${
              notification.type === 'success'
                ? 'bg-[#1A1A1A] text-white border border-[#FF6A00]/40'
                : 'bg-red-600 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 size={18} className="text-[#FF6A00]" />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#FF6A00] tracking-wider uppercase mb-1">
              <Globe size={13} />
              <span>Website Management</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Announcement Bar</span>
            </div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Top Announcement Bar</h1>
            <p className="text-xs text-[#6E6E6E] mt-0.5">
              Add multiple announcements that automatically rotate on your live customer storefront.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:border-[#FF6A00] hover:text-[#FF6A00] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ExternalLink size={13} /> View Live Storefront
            </a>

            <button
              onClick={handleSaveAnnouncement}
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl text-xs font-semibold hover:bg-[#E05E00] active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-[#FF6A00]/20 uppercase tracking-wider disabled:opacity-50"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Announcement Management (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Switch Card */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury border border-gray-100 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-marcellus text-lg text-gray-900 uppercase tracking-wider flex items-center gap-2 font-light">
                    <Megaphone size={18} className="text-[#FF6A00]" /> Announcement Bar Visibility
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Toggle whether the top announcement bar is visible to customers across the site.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAnnouncementActive(!announcementActive)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                    announcementActive ? 'bg-[#FF6A00]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                      announcementActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                  announcementActive
                    ? 'bg-green-50/60 border-green-200 text-green-800'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    announcementActive ? 'bg-green-600 animate-pulse' : 'bg-gray-400'
                  }`}
                />
                <span className="font-semibold">
                  {announcementActive
                    ? `Active: ${validAnnouncements.length} announcement(s) rotating on storefront.`
                    : 'Disabled: Top announcement bar is currently hidden.'}
                </span>
              </div>
            </div>

            {/* Multiple Announcements List Card */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury border border-gray-100 bg-white space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-marcellus text-lg text-gray-900 uppercase tracking-wider flex items-center gap-2 font-light">
                    <Sparkles size={18} className="text-[#FF6A00]" /> Multiple Announcements ({announcements.length})
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Each announcement rotates smoothly in the top bar every 4 seconds.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-[#FAF9F6] hover:bg-[#FF6A00] text-gray-800 hover:text-white border border-gray-200 hover:border-[#FF6A00] rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} /> Add Announcement
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {announcements.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200 flex items-center gap-3 group hover:border-[#FF6A00]/50 transition-all"
                  >
                    <span className="w-6 h-6 rounded-full bg-white text-gray-700 text-xs font-bold flex items-center justify-center border border-gray-200 shadow-sm shrink-0">
                      {index + 1}
                    </span>

                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleUpdateItem(index, e.target.value)}
                      placeholder="e.g. FREE SHIPPING ON ALL ORDERS ABOVE ₹1999"
                      className="flex-1 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00] uppercase tracking-wider text-gray-900"
                    />

                    {/* Move Up / Down Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <MoveUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, 'down')}
                        disabled={index === announcements.length - 1}
                        className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <MoveDown size={13} />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      title="Delete Announcement"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Announcement Large Button */}
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-[#FF6A00] text-gray-600 hover:text-[#FF6A00] bg-gray-50/50 hover:bg-[#FF6A00]/5 rounded-2xl text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Plus size={15} /> Add Another Announcement
              </button>

              {/* Quick Presets */}
              <div className="pt-3 border-t border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">
                  Quick Add Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 bg-[#FAF9F6] hover:bg-[#FF6A00]/10 border border-gray-200 hover:border-[#FF6A00] text-gray-700 hover:text-[#FF6A00] rounded-lg text-[10px] font-medium transition-all"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Link */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                  Optional Click Destination Link
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <LinkIcon size={14} />
                  </div>
                  <input
                    type="text"
                    value={announcementLink}
                    onChange={(e) => setAnnouncementLink(e.target.value)}
                    placeholder="e.g. /collection or /cart (leave blank if not clickable)"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00] bg-white text-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Mockup Preview (Col 3) */}
          <div className="space-y-6">
            <div className="glass-card rounded-[28px] p-6 shadow-luxury border border-gray-100 bg-white space-y-4">
              <div className="pb-3 border-b border-gray-100">
                <h4 className="font-marcellus text-base text-gray-900 uppercase tracking-wider flex items-center gap-2 font-light">
                  <Eye size={16} className="text-[#FF6A00]" /> Storefront Top Bar Live Preview
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Rotates through your announcements in real time
                </p>
              </div>

              {/* Storefront Top Bar Mockup */}
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-900 bg-[#121212] text-white select-none">
                {/* Simulated Announcement Bar */}
                <div className="px-4 py-3 border-b border-white/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-300">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 truncate">
                      <Mail size={11} className="text-[#FF6A00]" />
                      <span className="truncate">hello@sareestyle.com</span>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-gray-400">
                      <Phone size={11} className="text-[#FF6A00]" />
                      <span>+91 98765 43210</span>
                    </div>
                  </div>

                  {/* Center Announcement Ticker */}
                  {announcementActive ? (
                    <div className="py-1 flex items-center justify-center gap-2">
                      <span className="w-5 h-[1px] bg-white/20" />
                      <span className="w-1 h-1 rounded-full bg-[#FF6A00]" />

                      <div className="h-5 overflow-hidden flex items-center justify-center text-center">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={previewIndex}
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -12, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="text-[10px] uppercase font-semibold tracking-wider text-white truncate max-w-[200px]"
                          >
                            {currentPreviewText}
                          </motion.p>
                        </AnimatePresence>
                      </div>

                      <span className="w-1 h-1 rounded-full bg-[#FF6A00]" />
                      <span className="w-5 h-[1px] bg-white/20" />
                    </div>
                  ) : (
                    <div className="py-1.5 text-center text-[10px] text-gray-500 italic">
                      [ Announcement Bar Inactive — Hidden ]
                    </div>
                  )}
                </div>

                {/* Simulated Navigation Underneath */}
                <div className="h-11 px-4 flex items-center justify-between text-[10px] text-gray-300 bg-black/40">
                  <span className="font-marcellus text-xs text-white">DESIGNS OF DREAMS</span>
                  <div className="flex items-center gap-3 text-[9px] text-gray-400">
                    <span>Home</span>
                    <span>Collection</span>
                    <span>Contact</span>
                  </div>
                </div>
              </div>

              {/* Status information */}
              <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-gray-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Total Announcements:</span>
                  <span className="font-semibold text-gray-900">{validAnnouncements.length}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Currently Previewing:</span>
                  <span className="font-semibold text-[#FF6A00]">#{previewIndex + 1} of {validAnnouncements.length || 1}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Rotation Interval:</span>
                  <span className="font-semibold text-gray-900">4 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
