'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Save, Image, Plus, Trash2, Edit2, Upload, Sparkles, Eye } from 'lucide-react';

export default function GalleryManager() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [gallery, setGallery] = useState<any[]>([]);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('');
  const [galleryFilterTag, setGalleryFilterTag] = useState<'weaving' | 'embroidery' | 'coloring' | 'finishing'>('weaving');
  const [galleryImage, setGalleryImage] = useState('');
  const [galleryDesc, setGalleryDesc] = useState('');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  const galleryFileInputRef = React.useRef<HTMLInputElement>(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const filterTags = [
    { id: 'all', label: 'All Items' },
    { id: 'weaving', label: 'Weaving' },
    { id: 'embroidery', label: 'Embroidery' },
    { id: 'coloring', label: 'Coloring' },
    { id: 'finishing', label: 'Finishing' },
  ];

  const filteredGallery = activeFilter === 'all'
    ? gallery
    : gallery.filter(item => item.filterTag === activeFilter);

  const handleAddNewItemClick = () => {
    setEditingIndex(null);
    setGalleryTitle('');
    setGalleryCategory('');
    setGalleryFilterTag('weaving');
    setGalleryImage('');
    setGalleryDesc('');
    setIsEditingItem(true);
  };

  const handleEditGalleryItem = (index: number) => {
    // Find the actual index in the full gallery array
    const item = filteredGallery[index];
    const realIndex = gallery.findIndex(g => g.id === item.id);
    setEditingIndex(realIndex);
    setGalleryTitle(item.title || '');
    setGalleryCategory(item.category || '');
    setGalleryFilterTag(item.filterTag || 'weaving');
    setGalleryImage(item.image || '');
    setGalleryDesc(item.desc || '');
    setIsEditingItem(true);
  };

  const handleSaveGalleryItem = () => {
    if (!galleryTitle.trim() || !galleryImage.trim() || !galleryCategory.trim()) {
      alert('Please fill Title, Category, and Image fields.');
      return;
    }

    const item = {
      id: editingIndex !== null ? gallery[editingIndex].id : Date.now(),
      title: galleryTitle.trim(),
      category: galleryCategory.trim(),
      filterTag: galleryFilterTag,
      image: galleryImage.trim(),
      desc: galleryDesc.trim()
    };

    if (editingIndex !== null) {
      setGallery(prev => {
        const updated = [...prev];
        updated[editingIndex] = item;
        return updated;
      });
    } else {
      setGallery(prev => [...prev, item]);
    }
    setIsEditingItem(false);
  };

  const handleDeleteItem = (index: number) => {
    const item = filteredGallery[index];
    if (confirm(`Are you sure you want to remove "${item.title}"?`)) {
      setGallery(prev => prev.filter(g => g.id !== item.id));
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 4 * 1024 * 1024) {
      alert("File exceeds 4MB limit");
      return;
    }

    setIsUploadingGallery(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setGalleryImage(result.images[0].url);
      } else {
        alert(result.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    setMounted(true);
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/cms');
        const data = await res.json();
        if (data.success && data.cms) {
          setGallery(data.cms.gallery || []);
        }
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const handlePublishGallery = async () => {
    setSaving(true);
    try {
      // Fetch current CMS config first to avoid overwriting other fields
      const getRes = await fetch('/api/cms');
      const getData = await getRes.json();
      const currentCms = getData.success ? getData.cms : {};

      const res = await fetch('/api/cms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentCms,
          gallery
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Gallery published successfully! Changes are now live on the storefront.');
      } else {
        alert(data.error || 'Failed to publish gallery');
      }
    } catch (err) {
      console.error(err);
      alert('Error publishing gallery');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="space-y-5 sm:space-y-6 lg:space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4 sm:pb-5">
          <div>
            <h1 className="font-marcellus text-xl sm:text-2xl lg:text-3xl font-light text-[#1A1A1A]">Exhibition Gallery</h1>
            <p className="text-[10px] sm:text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">
              Manage artisan gallery cards displayed on the storefront
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6E6E6E] font-poppins">
              {gallery.length} item{gallery.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handlePublishGallery}
              disabled={saving}
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#1A1A1A] text-white rounded-[16px] text-[10px] sm:text-xs font-semibold hover:bg-[#FF6A00] transition-all flex items-center gap-2 shadow-md uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              {saving ? 'Publishing...' : 'Publish Gallery'}
            </button>
          </div>
        </div>

        {/* Filter Bar + Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 w-full sm:w-auto">
            {filterTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => setActiveFilter(tag.id)}
                className={`px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-semibold transition-all cursor-pointer uppercase tracking-wider whitespace-nowrap shrink-0 ${
                  activeFilter === tag.id
                    ? 'bg-[#1A1A1A] text-white shadow-sm'
                    : 'bg-white text-[#6E6E6E] border border-gray-200 hover:border-[#FF6A00] hover:text-[#FF6A00]'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddNewItemClick}
            className="px-4 sm:px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-[10px] sm:text-xs font-semibold hover:bg-[#FF6A00] transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer font-poppins shrink-0 w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus size={14} /> Add Gallery Item
          </button>
        </div>

        {/* Add/Edit Gallery Item Form */}
        {isEditingItem && (
          <div className="glass-card rounded-[20px] sm:rounded-[28px] p-4 sm:p-6 shadow-luxury border border-[rgba(255, 106, 0,0.25)] bg-[#FAF9F6] space-y-4 sm:space-y-5 font-poppins">
            <h4 className="font-marcellus text-lg font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
              <Sparkles size={16} className="text-[#FF6A00]" />
              {editingIndex !== null ? "Edit Gallery Exhibition Card" : "New Gallery Exhibition Card"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">Card Title</label>
                <input
                  type="text"
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  placeholder="e.g. Master Silk Weaver"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF6A00] bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">Display Category</label>
                <input
                  type="text"
                  value={galleryCategory}
                  onChange={(e) => setGalleryCategory(e.target.value)}
                  placeholder="e.g. Artisanal Handloom"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF6A00] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">Filter Tag Category</label>
                <select
                  value={galleryFilterTag}
                  onChange={(e) => setGalleryFilterTag(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF6A00] text-gray-700 bg-white font-poppins"
                >
                  <option value="weaving">Weaving Studio</option>
                  <option value="embroidery">Intricate Embroidery</option>
                  <option value="coloring">Organic Coloring</option>
                  <option value="finishing">Artisanal Finishing</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">Upload Card Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={galleryImage}
                    onChange={(e) => setGalleryImage(e.target.value)}
                    placeholder="Paste URL or upload image file"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF6A00] bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="px-4 bg-gray-150 hover:bg-[#FF6A00] hover:text-white rounded-xl text-xs transition-all border border-gray-200 cursor-pointer flex items-center justify-center text-gray-700"
                    title="Upload Image"
                  >
                    <Upload size={14} />
                  </button>
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                </div>
                {isUploadingGallery && <span className="text-[10px] text-gray-400 mt-1 block">Uploading...</span>}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">Short Narrative Description</label>
              <textarea
                rows={2}
                value={galleryDesc}
                onChange={(e) => setGalleryDesc(e.target.value)}
                placeholder="Narrate the craftsmanship story behind this stage..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF6A00] bg-white"
              />
            </div>

            {/* Image Preview */}
            {galleryImage && (
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={galleryImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Image loaded ✓</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingItem(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGalleryItem}
                className="px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-xs font-semibold hover:bg-[#FF6A00] cursor-pointer transition-all"
              >
                {editingIndex !== null ? 'Update Card' : 'Add Card'}
              </button>
            </div>
          </div>
        )}

        {/* Gallery Items Grid */}
        {filteredGallery.length === 0 ? (
          <div className="glass-card rounded-[20px] sm:rounded-[28px] p-6 sm:p-12 shadow-luxury text-center">
            <Image size={40} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-marcellus text-lg text-gray-400 uppercase tracking-wider">No Gallery Items</h3>
            <p className="text-xs text-gray-400 mt-2 font-poppins">
              {activeFilter !== 'all'
                ? `No items match the "${activeFilter}" filter. Try another filter or add a new item.`
                : 'Click "Add Gallery Item" to add your first exhibition card.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 font-poppins">
            {filteredGallery.map((item, idx) => (
              <div
                key={item.id || idx}
                className="relative group border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col justify-between hover:border-[#FF6A00] transition-all hover:shadow-md"
              >
                <div className="relative h-36 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Action buttons */}
                  <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="p-2 bg-white text-gray-700 rounded-full shadow hover:bg-[#FF6A00] hover:text-white cursor-pointer transition-all"
                      title="Preview"
                    >
                      <Eye size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditGalleryItem(idx)}
                      className="p-2 bg-white text-gray-700 rounded-full shadow hover:bg-[#FF6A00] hover:text-white cursor-pointer transition-all"
                      title="Edit Card"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      className="p-2 bg-white text-red-600 rounded-full shadow hover:bg-red-600 hover:text-white cursor-pointer transition-all"
                      title="Remove Card"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  {/* Filter Tag badge */}
                  <span className="absolute bottom-2.5 left-2.5 text-[9px] uppercase tracking-wider font-semibold bg-black/60 text-white px-2.5 py-1 rounded-full backdrop-blur-[2px]">
                    {item.filterTag}
                  </span>
                </div>
                <div className="p-4 space-y-1.5">
                  <span className="text-[8px] uppercase tracking-widest text-[#FF6A00] font-bold block">{item.category}</span>
                  <h5 className="font-semibold text-gray-800 text-sm truncate" title={item.title}>{item.title}</h5>
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {previewItem && (
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-8"
            onClick={() => setPreviewItem(null)}
          >
            <div
              className="bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-48 sm:h-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewItem.image} alt={previewItem.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <span className="text-[10px] uppercase tracking-widest font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    {previewItem.filterTag}
                  </span>
                </div>
              </div>
              <div className="p-5 sm:p-8 space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-[#FF6A00] font-bold">{previewItem.category}</span>
                <h3 className="font-marcellus text-2xl font-light text-[#1A1A1A]">{previewItem.title}</h3>
                <p className="text-sm text-[#6E6E6E] leading-relaxed font-poppins">{previewItem.desc}</p>
                <div className="pt-4">
                  <button
                    onClick={() => setPreviewItem(null)}
                    className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-xs font-semibold hover:bg-[#FF6A00] cursor-pointer transition-all uppercase tracking-wider"
                  >
                    Close Preview
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
