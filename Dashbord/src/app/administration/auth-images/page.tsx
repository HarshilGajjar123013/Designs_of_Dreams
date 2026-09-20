'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Save,
  ChevronUp,
  ChevronDown,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Layers,
  X,
  Monitor
} from 'lucide-react';

interface AuthSlot {
  id: string;
  pageType: 'login' | 'signup';
  slotNumber: number;
  imageUrl: string;
  storagePath?: string | null;
  isActive: boolean;
  displayOrder: number;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AuthPageImagesManagement() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loginSlots, setLoginSlots] = useState<AuthSlot[]>([]);
  const [signupSlots, setSignupSlots] = useState<AuthSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [targetSlotNumber, setTargetSlotNumber] = useState<number>(1);
  const [uploadSourceType, setUploadSourceType] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<AuthSlot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Live Collage Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Current active page slots
  const currentSlots = activeTab === 'login' ? loginSlots : signupSlots;
  const setCurrentSlots = (updater: (prev: AuthSlot[]) => AuthSlot[]) => {
    if (activeTab === 'login') {
      setLoginSlots(updater);
    } else {
      setSignupSlots(updater);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchSlots = async (page: 'login' | 'signup') => {
    try {
      const res = await fetch(`/api/admin/auth-images?page=${page}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.images)) {
        if (page === 'login') {
          setLoginSlots(data.images);
        } else {
          setSignupSlots(data.images);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch ${page} slots:`, err);
    }
  };

  useEffect(() => {
    setMounted(true);
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchSlots('login'), fetchSlots('signup')]);
      setLoading(false);
    };
    loadAll();
  }, []);

  // Handle active status toggle
  const handleToggleActive = async (slotNumber: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic UI update
    setCurrentSlots((prev) =>
      prev.map((s) => (s.slotNumber === slotNumber ? { ...s, isActive: newStatus } : s))
    );

    try {
      const res = await fetch('/api/admin/auth-images/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType: activeTab,
          slotNumber,
          isActive: newStatus,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      showNotification('success', `Slot ${slotNumber} is now ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (err: any) {
      // Revert on failure
      setCurrentSlots((prev) =>
        prev.map((s) => (s.slotNumber === slotNumber ? { ...s, isActive: currentStatus } : s))
      );
      showNotification('error', err.message || 'Failed to update slot status');
    }
  };

  // Reorder slots (move up or down)
  const handleMoveSlot = (slotNumber: number, direction: 'up' | 'down') => {
    setCurrentSlots((prev) => {
      const sorted = [...prev].sort((a, b) => a.displayOrder - b.displayOrder);
      const index = sorted.findIndex((s) => s.slotNumber === slotNumber);
      if (index < 0) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === sorted.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const currentItem = sorted[index];
      const targetItem = sorted[targetIndex];

      const tempOrder = currentItem.displayOrder;
      currentItem.displayOrder = targetItem.displayOrder;
      targetItem.displayOrder = tempOrder;

      return [...sorted];
    });
  };

  // Open Upload / Replace Modal for a slot
  const handleOpenUploadModal = (slotNumber: number) => {
    setTargetSlotNumber(slotNumber);
    setSelectedFile(null);
    setPreviewDataUrl('');
    setManualImageUrl('');
    setUploadError(null);
    setUploadSourceType('file');
    setIsUploadModalOpen(true);
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid format. Please upload JPG, PNG, WEBP, or AVIF.');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(`File is ${(file.size / 1024 / 1024).toFixed(1)}MB. Limit is 10MB.`);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit image upload or URL change
  const handleSaveUpload = async () => {
    setUploadError(null);
    let finalImageUrl = '';

    if (uploadSourceType === 'file') {
      if (!selectedFile) {
        setUploadError('Please choose an image file.');
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('pageType', activeTab);
        formData.append('slotNumber', targetSlotNumber.toString());

        const res = await fetch('/api/admin/auth-images/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Image upload failed');
        }
        finalImageUrl = data.url;
      } catch (err: any) {
        setIsUploading(false);
        setUploadError(err.message || 'Image upload failed');
        return;
      }
    } else {
      if (!manualImageUrl.trim() || !manualImageUrl.startsWith('http')) {
        setUploadError('Please enter a valid HTTP or HTTPS image URL.');
        return;
      }
      finalImageUrl = manualImageUrl.trim();
    }

    // Save slot with the new image URL
    try {
      const existingSlot = currentSlots.find((s) => s.slotNumber === targetSlotNumber);
      const res = await fetch('/api/admin/auth-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType: activeTab,
          slotNumber: targetSlotNumber,
          imageUrl: finalImageUrl,
          isActive: existingSlot ? existingSlot.isActive : true,
          displayOrder: existingSlot ? existingSlot.displayOrder : targetSlotNumber,
          title: `${activeTab === 'login' ? 'Login' : 'Sign Up'} Collage ${targetSlotNumber}`,
        }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state
      setCurrentSlots((prev) =>
        prev.map((s) =>
          s.slotNumber === targetSlotNumber
            ? { ...s, imageUrl: finalImageUrl, updatedAt: new Date().toISOString() }
            : s
        )
      );

      setIsUploadModalOpen(false);
      showNotification('success', `Slot ${targetSlotNumber} updated with new image!`);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to save slot');
    } finally {
      setIsUploading(false);
    }
  };

  // Confirm and execute slot reset / deletion
  const executeDeleteSlot = async () => {
    if (!deleteConfirmSlot) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/admin/auth-images?page=${activeTab}&slot=${deleteConfirmSlot.slotNumber}&id=${deleteConfirmSlot.id}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      // Re-fetch to get clean default image
      await fetchSlots(activeTab);

      setDeleteConfirmSlot(null);
      showNotification('success', `Slot ${deleteConfirmSlot.slotNumber} has been reset to default.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to reset slot');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save all slot changes (batch update orders and statuses)
  const handleSaveAllChanges = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/auth-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType: activeTab,
          slots: currentSlots,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      showNotification('success', `All ${activeTab === 'login' ? 'Login' : 'Sign Up'} image changes saved!`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[450px]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FF6A00]"></div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-poppins">Loading Auth Page Slots...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Active slots for collage preview
  const previewImages = [...currentSlots]
    .filter((s) => s.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((s) => s.imageUrl);

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in font-poppins pb-16">
        {/* Floating Notification Toast */}
        {notification && (
          <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-luxury text-sm font-medium transition-all ${
              notification.type === 'success'
                ? 'bg-[#0FA958] text-white'
                : 'bg-[#D83A3A] text-white'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="border-b border-gray-100 pb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#FF6A00] font-semibold mb-1">
              <Sparkles size={14} />
              <span>Authentication Page Management</span>
            </div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Auth Page Images</h1>
            <p className="text-xs text-[#6E6E6E] uppercase tracking-wider mt-1">
              Manage the 3x4 grid collage images dynamically displayed on the customer Login and Sign Up pages
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-[#FF6A00] text-gray-700 hover:text-[#FF6A00] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
            >
              <Eye size={15} />
              <span>Preview Live Collage</span>
            </button>
            <button
              onClick={handleSaveAllChanges}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A00] hover:bg-[#E55F00] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-luxury disabled:opacity-50"
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Login Page vs. Sign Up Page */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-px">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex items-center gap-2.5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 ${
                activeTab === 'login'
                  ? 'border-[#FF6A00] text-[#FF6A00] bg-[rgba(255,106,0,0.04)]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Layers size={16} />
              <span>Login Page Collage</span>
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-600">
                12 Slots
              </span>
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex items-center gap-2.5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 ${
                activeTab === 'signup'
                  ? 'border-[#FF6A00] text-[#FF6A00] bg-[rgba(255,106,0,0.04)]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Layers size={16} />
              <span>Sign Up Page Collage</span>
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-600">
                12 Slots
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <span>Grid Layout: 3 Columns × 4 Rows</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-[rgba(255,106,0,0.06)] to-[rgba(197,160,89,0.06)] border border-[rgba(255,106,0,0.15)] rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6A00] text-white flex items-center justify-center flex-shrink-0">
              <ImageIcon size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                Currently Managing: {activeTab === 'login' ? 'Public Sign In / Login' : 'Public Sign Up / Registration'} Page Images
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Each slot maps 1-to-1 with a tile in the right-side image collage. Only Active images are rendered publicly.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenUploadModal(1)}
            className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:border-[#FF6A00] rounded-xl text-[11px] font-semibold text-gray-700 hover:text-[#FF6A00] transition-all flex-shrink-0"
          >
            <Upload size={13} />
            <span>Upload to Slot 1</span>
          </button>
        </div>

        {/* 12-Slot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentSlots.map((slot) => {
            const slotPadded = slot.slotNumber < 10 ? `0${slot.slotNumber}` : `${slot.slotNumber}`;
            const isCustom = !slot.imageUrl.includes('photo-');

            return (
              <div
                key={slot.slotNumber}
                className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden shadow-sm hover:shadow-luxury ${
                  slot.isActive ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-75'
                }`}
              >
                {/* Slot Card Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-[#1A1A1A] text-white">
                      Slot {slotPadded}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Pos #{slot.displayOrder}
                    </span>
                  </div>

                  {/* Active Toggle Switch */}
                  <button
                    onClick={() => handleToggleActive(slot.slotNumber, slot.isActive)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                      slot.isActive
                        ? 'bg-[rgba(15,169,88,0.12)] text-[#0FA958] hover:bg-[rgba(15,169,88,0.2)]'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={slot.isActive ? 'Click to disable' : 'Click to enable'}
                  >
                    {slot.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    <span>{slot.isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>

                {/* Image Preview Box */}
                <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden group">
                  <img
                    src={slot.imageUrl}
                    alt={`Slot ${slot.slotNumber}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback placeholder if broken
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  {!slot.isActive && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-3 py-1 bg-black/80 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
                        Inactive / Hidden
                      </span>
                    </div>
                  )}

                  {/* Hover Quick Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                    <button
                      onClick={() => handleOpenUploadModal(slot.slotNumber)}
                      className="p-2.5 bg-white text-[#1A1A1A] hover:bg-[#FF6A00] hover:text-white rounded-xl transition-all shadow-md"
                      title="Replace Image"
                    >
                      <Upload size={16} />
                    </button>
                    <a
                      href={slot.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white text-[#1A1A1A] hover:bg-[#FF6A00] hover:text-white rounded-xl transition-all shadow-md"
                      title="View High-Res in New Tab"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => setDeleteConfirmSlot(slot)}
                      className="p-2.5 bg-white text-[#D83A3A] hover:bg-[#D83A3A] hover:text-white rounded-xl transition-all shadow-md"
                      title="Reset to Default"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Slot Details & Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                      <span className="font-medium text-gray-700 truncate max-w-[140px]">
                        {slot.title || `Collage Slot ${slotPadded}`}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {isCustom ? 'Uploaded' : 'Curated'}
                      </span>
                    </div>

                    <div className="text-[10px] text-gray-400 truncate font-mono bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                      {slot.imageUrl}
                    </div>
                  </div>

                  {/* Action Buttons & Order Controls */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenUploadModal(slot.slotNumber)}
                      className="flex-1 py-1.5 px-2.5 bg-gray-50 hover:bg-[#FF6A00] hover:text-white text-gray-700 text-[11px] font-semibold rounded-lg transition-all text-center"
                    >
                      Replace Image
                    </button>

                    {/* Order Steppers */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveSlot(slot.slotNumber, 'up')}
                        className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-800 transition-all"
                        title="Move Up"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        onClick={() => handleMoveSlot(slot.slotNumber, 'down')}
                        className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-800 transition-all"
                        title="Move Down"
                      >
                        <ChevronDown size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* UPLOAD / REPLACE IMAGE MODAL */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-luxury overflow-hidden animate-scale-up space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[rgba(255,106,0,0.1)] text-[#FF6A00] flex items-center justify-center">
                    <Upload size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Replace Image for Slot {targetSlotNumber < 10 ? `0${targetSlotNumber}` : targetSlotNumber}
                    </h3>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                      Page: {activeTab.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Source Switcher: Upload File vs Image URL */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setUploadSourceType('file')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    uploadSourceType === 'file'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Upload Local File
                </button>
                <button
                  onClick={() => setUploadSourceType('url')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    uploadSourceType === 'url'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Direct Image URL
                </button>
              </div>

              {/* Upload Dropzone / File Picker */}
              {uploadSourceType === 'file' ? (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                  />

                  {previewDataUrl ? (
                    <div className="space-y-3">
                      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={previewDataUrl}
                          alt="Upload preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewDataUrl('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black transition-all"
                          title="Remove"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-center text-gray-500 truncate">
                        Selected: <span className="font-medium text-gray-800">{selectedFile?.name}</span> (
                        {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-[#FF6A00] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-gray-50 hover:bg-[rgba(255,106,0,0.02)] transition-all group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-[#FF6A00] transition-colors">
                        <Upload size={22} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-700">
                          Click to select or drag & drop image
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                          JPG, PNG, WEBP, or AVIF (Up to 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Image Link (URL)
                  </label>
                  <input
                    type="url"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or /uploads/..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                  {manualImageUrl.trim().startsWith('http') && (
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 mt-2">
                      <img
                        src={manualImageUrl.trim()}
                        alt="URL Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-[rgba(216,58,58,0.08)] border border-[rgba(216,58,58,0.2)] rounded-xl text-xs text-[#D83A3A] flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUpload}
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#E55F00] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-luxury disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading && <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>}
                  <span>{isUploading ? 'Uploading...' : 'Save Image'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE / RESET CONFIRMATION MODAL */}
        {deleteConfirmSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-luxury space-y-5 animate-scale-up">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(216,58,58,0.1)] text-[#D83A3A] flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-gray-900">Reset Slot {deleteConfirmSlot.slotNumber}?</h3>
                <p className="text-xs text-gray-500">
                  Are you sure you want to delete this image? The slot will be reset back to the default curated heritage image.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmSlot(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDeleteSlot}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-[#D83A3A] hover:bg-[#C22E2E] text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
                >
                  {isDeleting ? 'Resetting...' : 'Yes, Reset'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIVE COLLAGE PREVIEW MODAL */}
        {isPreviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#FAF9F6] rounded-3xl max-w-5xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-scale-up">
              {/* Preview Header */}
              <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center">
                    <Monitor size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Live Collage Mock Preview — {activeTab.toUpperCase()} PAGE
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Showing {previewImages.length} active image slots as they appear on the public storefront
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Collage Grid Rendering matching dodshop Login.scss */}
              <div className="flex-1 p-6 overflow-hidden flex items-center justify-center">
                <div
                  className="grid grid-cols-3 grid-rows-4 gap-2 w-full h-full max-w-3xl rounded-2xl overflow-hidden p-2 bg-white shadow-luxury"
                  style={{ maxHeight: 'calc(85vh - 100px)' }}
                >
                  {previewImages.slice(0, 12).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative overflow-hidden rounded-lg bg-gray-100 group shadow-sm"
                    >
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-mono rounded">
                        #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
