'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Eye,
  CheckCircle2,
  Save,
  Sparkles,
  AlertCircle,
  ExternalLink,
  X,
  RefreshCw,
  Globe,
  Megaphone,
  ArrowUpRight,
  Maximize2,
  Plus,
  Layers
} from 'lucide-react';

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

export default function HomepageManagement() {
  const [mounted, setMounted] = useState(false);
  const [cms, setCms] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Active slide tab: 1, 2, or 3
  const [activeSlideTab, setActiveSlideTab] = useState<number>(1);

  // Hero fields
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');

  // Additional slide images (slide 2, slide 3)
  const [slideImages, setSlideImages] = useState<Record<number, string>>({
    1: '',
    2: '',
    3: ''
  });

  // Multiple Announcements State
  const [announcements, setAnnouncements] = useState<string[]>([
    'FREE SHIPPING ON ALL ORDERS ABOVE ₹1999'
  ]);
  const [announcementLink, setAnnouncementLink] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(true);

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Modals & Notifications
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setHeroTitle(data.cms.heroTitle || 'A place to display your Heritage.');
        setHeroSubtitle(data.cms.heroSubtitle || 'Where centuries old traditions meet contemporary craftsmanship.');
        
        // Parse hero image (single string or JSON array)
        let primaryImg = '';
        let s2 = '';
        let s3 = '';
        if (data.cms.heroImage) {
          try {
            const parsed = JSON.parse(data.cms.heroImage);
            if (Array.isArray(parsed)) {
              primaryImg = parsed[0] || '';
              s2 = parsed[1] || '';
              s3 = parsed[2] || '';
            } else {
              primaryImg = data.cms.heroImage;
            }
          } catch {
            primaryImg = data.cms.heroImage;
          }
        }
        setHeroImage(primaryImg);
        setSlideImages({
          1: primaryImg,
          2: s2,
          3: s3
        });

        // Announcements
        const parsedAnn = parseAnnouncements(data.cms.announcementText);
        setAnnouncements(parsedAnn);
        setAnnouncementLink(data.cms.announcementLink || '');
        setAnnouncementActive(data.cms.announcementActive ?? true);

        // SEO
        setSeoTitle(data.cms.seoTitle || '');
        setSeoDescription(data.cms.seoDescription || '');
      }
    } catch (err) {
      console.error('Failed to load CMS configs:', err);
      showToast('error', 'Failed to retrieve website settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchCmsData();
  }, []);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handlePublishChanges();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [heroTitle, heroSubtitle, heroImage, slideImages, announcements, announcementLink, announcementActive, seoTitle, seoDescription, cms]);

  const handleFileUpload = async (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowed.includes(file.type)) {
      showToast('error', 'Invalid format. Allowed: JPG, PNG, WEBP, AVIF');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'File size exceeds 10MB limit');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.images && data.images.length > 0) {
        const uploadedUrl = data.images[0].url;
        
        // Update current slide tab
        setSlideImages((prev) => ({
          ...prev,
          [activeSlideTab]: uploadedUrl
        }));

        if (activeSlideTab === 1) {
          setHeroImage(uploadedUrl);
        }

        showToast('success', `Slide ${activeSlideTab} image uploaded! Click "Publish Changes" to save.`);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Image upload error:', err);
      showToast('error', err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePublishChanges = async () => {
    setIsSaving(true);
    try {
      const currentCms = cms || {};
      
      // Determine heroImage payload (if only slide 1 has custom image, save string; if multiple, save JSON array string)
      const s1 = slideImages[1] || heroImage;
      const s2 = slideImages[2] || '';
      const s3 = slideImages[3] || '';
      
      let finalHeroImagePayload = s1.trim();
      if (s2.trim() || s3.trim()) {
        finalHeroImagePayload = JSON.stringify([s1.trim(), s2.trim(), s3.trim()]);
      }

      // Announcements payload
      const cleanAnnouncements = announcements.map((s) => s.trim()).filter((s) => s.length > 0);
      const finalAnnouncementPayload = cleanAnnouncements.length > 0
        ? cleanAnnouncements.join('\n')
        : 'FREE SHIPPING ON ALL ORDERS ABOVE ₹1999';

      const res = await fetch('/api/cms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentCms,
          heroTitle: heroTitle.trim() || 'A place to display your Heritage.',
          heroSubtitle: heroSubtitle.trim() || 'Where centuries old traditions meet contemporary craftsmanship.',
          heroImage: finalHeroImagePayload,
          announcementText: finalAnnouncementPayload,
          announcementLink: announcementLink.trim(),
          announcementActive,
          seoTitle: seoTitle.trim(),
          seoDescription: seoDescription.trim(),
        })
      });
      const data = await res.json();
      if (data.success) {
        setCms(data.cms);
        showToast('success', 'Homepage content published! Changes are now live on storefront.');
      } else {
        throw new Error(data.error || 'Failed to update CMS config');
      }
    } catch (err: any) {
      console.error('Failed to publish CMS:', err);
      showToast('error', err.message || 'Error publishing changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHeroImage = async () => {
    setSlideImages((prev) => ({ ...prev, [activeSlideTab]: '' }));
    if (activeSlideTab === 1) setHeroImage('');
    setShowDeleteModal(false);
    setIsSaving(true);
    try {
      const currentCms = cms || {};
      const res = await fetch('/api/cms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentCms,
          heroImage: '',
        })
      });
      const data = await res.json();
      if (data.success) {
        setCms(data.cms);
        showToast('success', `Slide ${activeSlideTab} image removed. Reverted to default heritage image.`);
      }
    } catch (err: any) {
      console.error('Failed to clear hero image:', err);
      showToast('error', 'Failed to clear hero image');
    } finally {
      setIsSaving(false);
    }
  };

  // Multiple Announcement Handlers
  const handleUpdateAnnouncement = (idx: number, val: string) => {
    setAnnouncements((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleAddAnnouncement = () => {
    setAnnouncements((prev) => [...prev, '']);
  };

  const handleRemoveAnnouncement = (idx: number) => {
    setAnnouncements((prev) => {
      if (prev.length <= 1) return [''];
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Active slide display calculations
  const defaultSlideFallbacks: Record<number, string> = {
    1: '/assets/hero/hero_1.png',
    2: '/assets/hero/hero_2.png',
    3: '/assets/hero/hero_3.png'
  };

  const currentSlideImage = slideImages[activeSlideTab]?.trim() || (activeSlideTab === 1 ? heroImage.trim() : '');
  const displayHeroImage = currentSlideImage || defaultSlideFallbacks[activeSlideTab] || '/assets/hero/hero_1.png';
  const isDefaultImage = !currentSlideImage;

  if (!mounted || loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-[#FF6A00]"></div>
          <p className="text-xs font-poppins text-gray-400 uppercase tracking-widest">Loading Homepage CMS...</p>
        </div>
      </AdminLayout>
    );
  }

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
              <span className="text-gray-600">Homepage</span>
            </div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Homepage & Hero Management</h1>
            <p className="text-xs text-[#6E6E6E] mt-0.5">
              Manage your Hero Banner Section, multiple announcement tickers, and upload custom images with live preview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:border-[#FF6A00] hover:text-[#FF6A00] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ExternalLink size={13} /> Live Storefront
            </a>

            <button
              onClick={handlePublishChanges}
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl text-xs font-semibold hover:bg-[#E05E00] active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-[#FF6A00]/20 uppercase tracking-wider disabled:opacity-50"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {isSaving ? 'Publishing...' : 'Publish Changes'}
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* HERO BANNER SECTION */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-6 border border-gray-100 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                <div>
                  <h3 className="font-marcellus text-xl text-gray-900 uppercase tracking-wider flex items-center gap-2 font-light">
                    <ImageIcon size={20} className="text-[#FF6A00]" /> Hero Banner Section
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Customize the headline, subtitle, and upload the background image for your homepage hero slides.
                  </p>
                </div>

                {/* Slide Selector Tabs */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setActiveSlideTab(num)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold tracking-wider uppercase transition-all ${
                        activeSlideTab === num
                          ? 'bg-[#FF6A00] text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Slide {num} {num === 1 && '(Main)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. Headline & Subtitle Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">
                    Main Headline Heading {activeSlideTab === 1 && '(Slide 1)'}
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="e.g. Redefining Luxury Fashion."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00] bg-white text-gray-800"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Tip: Wrap words in &lt;span&gt;...&lt;/span&gt; for golden/accent color emphasis.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">
                    Sub-Headline Description {activeSlideTab === 1 && '(Slide 1)'}
                  </label>
                  <textarea
                    rows={2}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="e.g. Unapologetically authentic. Timeless pieces designed to empower your unique style and heritage."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00] bg-white text-gray-800"
                  />
                </div>
              </div>

              {/* 2. UPLOAD IMG OPTION (Directly under Hero Banner Section) */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-gray-700 tracking-wider flex items-center gap-1.5">
                    <Upload size={14} className="text-[#FF6A00]" /> Upload Image Option — Slide {activeSlideTab}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                      isDefaultImage
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-[#FF6A00]/10 text-[#FF6A00]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isDefaultImage ? 'bg-gray-400' : 'bg-[#FF6A00] animate-pulse'}`} />
                    {isDefaultImage ? 'Default Heritage Visual' : 'Custom Upload Active'}
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Interactive Live Hero Banner Preview Box */}
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-950 group shadow-lg min-h-[260px] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayHeroImage}
                    alt="Hero Banner Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

                  {/* Simulated Content */}
                  <div className="relative z-10 text-center text-white px-6 py-8 max-w-lg space-y-2 select-none pointer-events-none">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase font-semibold tracking-widest text-[#FF6A00] bg-black/50 backdrop-blur-md border border-[#FF6A00]/30 mb-1">
                      Preview — Slide {activeSlideTab}
                    </span>
                    <h2 className="font-marcellus text-2xl sm:text-3xl font-light leading-tight tracking-wide drop-shadow-md">
                      {heroTitle || 'Redefining Luxury Fashion.'}
                    </h2>
                    <p className="text-xs text-gray-300 line-clamp-2 max-w-sm mx-auto font-light leading-relaxed">
                      {heroSubtitle || 'Unapologetically authentic. Timeless pieces designed to empower your unique style.'}
                    </p>
                  </div>

                  {/* Action Buttons on top of image */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="p-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-xl text-xs transition-all shadow-md hover:text-[#FF6A00]"
                      title="Fullscreen Preview"
                    >
                      <Maximize2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3.5 py-2 bg-white text-gray-900 hover:bg-[#FF6A00] hover:text-white rounded-xl text-xs font-semibold tracking-wider transition-all shadow-md flex items-center gap-1.5"
                    >
                      <Upload size={13} /> {isUploading ? 'Uploading...' : 'Upload / Replace Image'}
                    </button>

                    {!isDefaultImage && (
                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="p-2 bg-red-600/80 hover:bg-red-600 backdrop-blur-md text-white rounded-xl text-xs transition-all shadow-md"
                        title="Delete / Revert to Default"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-[#FF6A00] bg-gray-50/50 hover:bg-[#FF6A00]/5 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#FF6A00]">
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      Click to choose image file or drag & drop for Slide {activeSlideTab}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Supports JPG, PNG, WEBP, AVIF up to 10MB. Automatically copied to storefront upload directory.
                    </p>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">
                    Banner Background Image URL (Slide {activeSlideTab})
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={slideImages[activeSlideTab] || (activeSlideTab === 1 ? heroImage : '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSlideImages((prev) => ({ ...prev, [activeSlideTab]: val }));
                        if (activeSlideTab === 1) setHeroImage(val);
                      }}
                      placeholder="e.g. /uploads/products/image.jpg or https://..."
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00] bg-white text-gray-800"
                    />
                    {(slideImages[activeSlideTab] || (activeSlideTab === 1 && heroImage)) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSlideImages((prev) => ({ ...prev, [activeSlideTab]: '' }));
                          if (activeSlideTab === 1) setHeroImage('');
                        }}
                        className="px-3 py-2 text-xs font-medium text-gray-400 hover:text-red-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                        title="Clear URL"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* MULTIPLE ANNOUNCEMENTS SECTION */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-5 border border-gray-100 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                <div>
                  <h3 className="font-marcellus text-xl text-gray-900 uppercase tracking-wider flex items-center gap-2 font-light">
                    <Megaphone size={18} className="text-[#FF6A00]" /> Multiple Announcement Bar Items ({announcements.length})
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Add multiple announcements. They automatically cycle every 4 seconds on the top header ticker.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                    <span>Active:</span>
                    <input
                      type="checkbox"
                      checked={announcementActive}
                      onChange={(e) => setAnnouncementActive(e.target.checked)}
                      className="w-4 h-4 accent-[#FF6A00] rounded"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleAddAnnouncement}
                    className="px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#FF6A00] text-gray-800 hover:text-white border border-gray-200 hover:border-[#FF6A00] rounded-xl text-[11px] font-semibold tracking-wider transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Plus size={13} /> Add Item
                  </button>
                </div>
              </div>

              {/* Announcements List */}
              <div className="space-y-3">
                {announcements.map((ann, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50/80 rounded-2xl border border-gray-200 flex items-center gap-3 hover:border-[#FF6A00]/50 transition-all"
                  >
                    <span className="w-6 h-6 rounded-full bg-white text-gray-700 text-[11px] font-bold flex items-center justify-center border border-gray-200 shrink-0 shadow-sm">
                      {idx + 1}
                    </span>

                    <input
                      type="text"
                      value={ann}
                      onChange={(e) => handleUpdateAnnouncement(idx, e.target.value)}
                      placeholder="e.g. FREE SHIPPING ON ALL ORDERS ABOVE ₹1999"
                      className="flex-1 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00] uppercase tracking-wider text-gray-900"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveAnnouncement(idx)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      title="Delete Announcement"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleAddAnnouncement}
                  className="py-2.5 px-4 border border-dashed border-gray-300 hover:border-[#FF6A00] text-gray-700 hover:text-[#FF6A00] rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Add Another Announcement
                </button>

                <Link
                  href="/website-management/announcement"
                  className="text-xs text-[#FF6A00] hover:underline font-semibold flex items-center gap-1"
                >
                  Open Dedicated Announcement Bar Page <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* SEARCH & SEO METADATA */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-4 border border-gray-100 bg-white">
              <div className="pb-3 border-b border-gray-100">
                <h3 className="font-marcellus text-xl text-gray-900 uppercase tracking-wider flex items-center gap-2 font-light">
                  <Globe size={18} className="text-[#FF6A00]" /> Search Engine Optimization (SEO)
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Optimize homepage search engine indexing and browser tab title.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">
                    Google SEO Page Title
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Designs of Dreams — Luxury Indian Ethnic Wear & Bridal Couture"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00] bg-white text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">
                    Meta Description Text
                  </label>
                  <textarea
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Discover hand-woven Kanjeevarams, double-ikat Patan Patolas, and bespoke couture."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00] bg-white text-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Previews (Col 3) */}
          <div className="space-y-8">
            {/* Storefront Live Card Preview */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-4 border border-gray-100 bg-white">
              <div className="pb-3 border-b border-gray-100">
                <h4 className="font-marcellus text-base text-gray-900 uppercase tracking-wider flex items-center gap-2 font-light">
                  <Eye size={16} className="text-[#FF6A00]" /> Shop Front Live Preview
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Mimicking customer landing view</p>
              </div>

              {/* Faux Frame */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-black relative">
                {/* Announcement Ticker */}
                {announcementActive && announcements.length > 0 && (
                  <div className="bg-[#1A1A1A] border-b border-white/10 text-white text-[8px] py-1.5 px-3 text-center uppercase tracking-widest font-semibold truncate flex items-center justify-center gap-2">
                    <span className="w-3 h-[1px] bg-white/20" />
                    <span className="w-1 h-1 rounded-full bg-[#FF6A00]" />
                    <span className="truncate">{announcements[0] || 'FREE SHIPPING ON ALL ORDERS ABOVE ₹1999'}</span>
                    <span className="w-1 h-1 rounded-full bg-[#FF6A00]" />
                    <span className="w-3 h-[1px] bg-white/20" />
                  </div>
                )}

                {/* Navbar */}
                <div className="h-9 px-3 bg-black/60 backdrop-blur-sm border-b border-white/10 flex items-center justify-between text-[9px] text-white">
                  <span className="font-marcellus font-light">Designs of Dreams</span>
                  <div className="flex gap-2 text-gray-300 text-[8px]">
                    <span>Home</span>
                    <span>Collection</span>
                    <span>About</span>
                  </div>
                </div>

                {/* Hero Banner */}
                <div className="h-44 relative flex items-center justify-center text-center p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayHeroImage}
                    alt="Mock Banner"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="relative z-10 text-white space-y-1 max-w-xs">
                    <span className="text-[7px] uppercase tracking-widest text-[#FF6A00] bg-black/40 px-2 py-0.5 rounded-full">
                      Slide {activeSlideTab}
                    </span>
                    <h5 className="font-marcellus text-sm font-light uppercase tracking-widest truncate">
                      {heroTitle || 'Redefining Luxury Fashion.'}
                    </h5>
                    <p className="text-[8px] text-gray-200 font-light leading-relaxed line-clamp-2">
                      {heroSubtitle || 'Unapologetically authentic. Timeless pieces designed to empower your unique style.'}
                    </p>
                    <div className="pt-1">
                      <span className="bg-[#FF6A00] text-white text-[7px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Shop Now
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Summary Info Card */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-3 border border-gray-100 bg-white text-xs">
              <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Homepage Overview</h4>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span>Hero Slides:</span>
                  <span className="font-semibold text-gray-900">3 Slides (Swiper)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span>Active Hero Visual:</span>
                  <span className="font-semibold text-[#FF6A00]">{isDefaultImage ? 'Default' : 'Custom Upload'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span>Announcements:</span>
                  <span className="font-semibold text-gray-900">{announcements.filter(s => s.trim().length > 0).length} Item(s)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Ticker Status:</span>
                  <span className="font-semibold text-green-600">{announcementActive ? 'Active' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[24px] max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-marcellus text-xl text-gray-900">Remove Slide {activeSlideTab} Custom Image?</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Are you sure you want to remove the custom image for Slide {activeSlideTab}? It will immediately revert to the default luxury heritage image.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteHeroImage}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold tracking-wider transition-all shadow-md shadow-red-600/20 uppercase"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FULLSCREEN PREVIEW MODAL */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
              title="Close"
            >
              <X size={20} />
            </button>

            <div className="max-w-5xl w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayHeroImage}
                alt="Full Hero Preview"
                className="w-full max-h-[80vh] object-contain bg-black"
              />
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent text-white flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold">{heroTitle || 'Heritage Luxury'}</p>
                  <p className="text-gray-400 text-[11px] truncate max-w-lg">{displayHeroImage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false);
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 bg-[#FF6A00] text-white rounded-xl text-xs font-semibold hover:bg-[#E05E00]"
                >
                  Upload Replacement Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
