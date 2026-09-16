'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Save, Image, Plus, Trash2, Edit2, Upload, Sparkles, Eye, X, Tag } from 'lucide-react';

const defaultGalleryData = [
  {
    id: 1,
    title: "Detail & Thread",
    category: "Detail Studio",
    filterTag: "embroidery",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
    desc: "Finely spun gold threads embroidered onto heavy velvet base fabric."
  },
  {
    id: 2,
    title: "The Master Weaver",
    category: "Artisanal Handloom",
    filterTag: "weaving",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop",
    desc: "Varanasi master weaver hand-weaving mulberry silk over weeks of dedicated labor."
  },
  {
    id: 3,
    title: "Zardozi Handwork",
    category: "Intricate Embroidery",
    filterTag: "embroidery",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
    desc: "Detailed shadow embroidery and metal wire applique from Lucknow on georgette."
  },
  {
    id: 4,
    title: "Heritage Spools",
    category: "Weaving Spools",
    filterTag: "weaving",
    image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800&auto=format&fit=crop",
    desc: "Premium colored silk threads prepared on traditional reels, ready for looms."
  },
  {
    id: 5,
    title: "Draping Elegance",
    category: "Bridal Drape",
    filterTag: "weaving",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    desc: "Mulberry silk saree exhibiting detailed pure silver zari brocade work."
  },
  {
    id: 6,
    title: "Indigo Dye Vat",
    category: "Organic Coloring",
    filterTag: "coloring",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop",
    desc: "Traditional hand-dyeing processes using pure organic botanical indigo vats."
  },
  {
    id: 7,
    title: "The Crimson Silk",
    category: "Festive Crimson",
    filterTag: "coloring",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
    desc: "Crimson hand-dyed organic silk threads drying in the afternoon sun."
  },
  {
    id: 8,
    title: "Craft Dyeing Vat",
    category: "Colors & Craft",
    filterTag: "coloring",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
    desc: "Botanical ingredients creating natural organic coloring solutions for yarn."
  },
  {
    id: 9,
    title: "Block Print Matrix",
    category: "Hand-Block Printing",
    filterTag: "finishing",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
    desc: "Hand-carved seasoned teak wood block matrices used for printing intricate motifs."
  },
  {
    id: 10,
    title: "Gold Zari Skeins",
    category: "Pure Zari Work",
    filterTag: "weaving",
    image: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=800&auto=format&fit=crop",
    desc: "Fine silver wire bundles electroplated with pure gold ready to be woven into borders."
  },
  {
    id: 11,
    title: "The Finishing Touch",
    category: "Quality Inspection",
    filterTag: "finishing",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=800&auto=format&fit=crop",
    desc: "Meticulous quality inspection and thread trimming on finished sarees before packing."
  },
  {
    id: 12,
    title: "Loom Drafting",
    category: "Design Mapping",
    filterTag: "weaving",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
    desc: "Traditional card drafting and loom-harness mapping for floral zari grids."
  }
];

const defaultFilterTags = [
  { id: 'weaving', label: 'Weaving Studio' },
  { id: 'embroidery', label: 'Intricate Embroidery' },
  { id: 'coloring', label: 'Organic Coloring' },
  { id: 'finishing', label: 'Artisanal Finishing' }
];

export default function GalleryManager() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [gallery, setGallery] = useState<any[]>(defaultGalleryData);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('');
  const [galleryFilterTag, setGalleryFilterTag] = useState<string>('weaving');
  const [galleryImage, setGalleryImage] = useState('');
  const [galleryDesc, setGalleryDesc] = useState('');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  const galleryFileInputRef = React.useRef<HTMLInputElement>(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Dynamic filter tag categories
  const [customFilterTags, setCustomFilterTags] = useState<{ id: string; label: string }[]>(defaultFilterTags);
  const [showTagModal, setShowTagModal] = useState(false);
  const [modalTagName, setModalTagName] = useState('');
  const [modalTagError, setModalTagError] = useState('');
  const modalTagInputRef = React.useRef<HTMLInputElement>(null);

  const allFilterTags = [...customFilterTags];
  const filterTags = [{ id: 'all', label: 'All Items' }, ...allFilterTags];

  const filteredGallery = activeFilter === 'all'
    ? gallery
    : gallery.filter(item => item.filterTag === activeFilter);

  const handleAddNewItemClick = () => {
    setEditingIndex(null);
    setGalleryTitle('');
    setGalleryCategory('');
    setGalleryFilterTag(allFilterTags.length > 0 ? allFilterTags[0].id : 'weaving');
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

  // Add tag via modal (from form or top bar + button)
  const handleModalAddTag = async () => {
    const name = modalTagName.trim();
    if (!name) { setModalTagError('Please enter a tag name'); return; }
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (allFilterTags.some(t => t.id === id)) {
      setModalTagError('A tag with that name already exists');
      return;
    }
    const nextTags = [...customFilterTags, { id, label: name }];
    setCustomFilterTags(nextTags);
    setGalleryFilterTag(id);
    setActiveFilter(id);
    setModalTagName('');
    setModalTagError('');
    setShowTagModal(false);

    // Auto-save to database immediately
    try {
      const getRes = await fetch('/api/cms');
      const getData = await getRes.json();
      const currentCms = getData.success ? getData.cms : {};

      await fetch('/api/cms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentCms,
          gallery,
          galleryFilterTags: nextTags
        })
      });
    } catch (err) {
      console.error('Failed to auto-save new tag:', err);
    }
  };

  useEffect(() => {
    if (showTagModal && modalTagInputRef.current) {
      modalTagInputRef.current.focus();
    }
  }, [showTagModal]);

  // Delete custom filter tag
  const handleDeleteFilterTag = async (tagId: string) => {
    if (!confirm('Remove this filter tag? Gallery items using it will keep their tag but won\'t be filterable until reassigned.')) return;
    const nextTags = customFilterTags.filter(t => t.id !== tagId);
    setCustomFilterTags(nextTags);
    if (activeFilter === tagId) setActiveFilter('all');

    // Auto-save tag removal immediately so it never returns on refresh
    try {
      const getRes = await fetch('/api/cms');
      const getData = await getRes.json();
      const currentCms = getData.success ? getData.cms : {};

      await fetch('/api/cms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentCms,
          gallery,
          galleryFilterTags: nextTags
        })
      });
    } catch (err) {
      console.error('Failed to auto-save tag deletion:', err);
    }
  };

  useEffect(() => {
    setMounted(true);
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/cms');
        const data = await res.json();
        if (data.success && data.cms) {
          if (Array.isArray(data.cms.gallery)) {
            setGallery(data.cms.gallery);
          } else {
            setGallery(defaultGalleryData);
          }

          if (Array.isArray(data.cms.galleryFilterTags)) {
            setCustomFilterTags(data.cms.galleryFilterTags);
          } else {
            setCustomFilterTags(defaultFilterTags);
          }
        } else {
          setGallery(defaultGalleryData);
          setCustomFilterTags(defaultFilterTags);
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
          gallery,
          galleryFilterTags: customFilterTags
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
              <div key={tag.id} className="relative flex items-center shrink-0">
                <button
                  onClick={() => setActiveFilter(tag.id)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-semibold transition-all cursor-pointer uppercase tracking-wider whitespace-nowrap ${
                    activeFilter === tag.id
                      ? 'bg-[#1A1A1A] text-white shadow-sm'
                      : 'bg-white text-[#6E6E6E] border border-gray-200 hover:border-[#FF6A00] hover:text-[#FF6A00]'
                  } ${customFilterTags.some(ct => ct.id === tag.id) ? 'pr-7 sm:pr-8' : ''}`}
                >
                  {tag.label}
                </button>
                {/* Show delete X on custom tags */}
                {customFilterTags.some(ct => ct.id === tag.id) && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteFilterTag(tag.id); }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                    title={`Remove "${tag.label}" tag`}
                  >
                    <X size={9} />
                  </button>
                )}
              </div>
            ))}

            {/* Add new filter tag button - opens stylish popup */}
            <button
              type="button"
              onClick={() => { setModalTagName(''); setModalTagError(''); setShowTagModal(true); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-dashed border-[#FF6A00]/50 bg-[#FF6A00]/5 text-[10px] sm:text-xs text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white transition-all cursor-pointer shrink-0 uppercase tracking-wider font-semibold"
              title="Add new filter tag category"
            >
              <Plus size={12} /> Add Tag
            </button>
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
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">
                  <span className="flex items-center gap-1"><Tag size={10} /> Filter Tag Category</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={galleryFilterTag}
                    onChange={(e) => setGalleryFilterTag(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF6A00] text-gray-700 bg-white font-poppins"
                  >
                    {allFilterTags.length === 0 && (
                      <option value="" disabled>No tags yet — add one →</option>
                    )}
                    {allFilterTags.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => { setModalTagName(''); setModalTagError(''); setShowTagModal(true); }}
                    className="px-3 py-3 bg-gray-100 hover:bg-[#FF6A00] hover:text-white rounded-xl text-xs transition-all border border-gray-200 cursor-pointer flex items-center justify-center text-gray-700"
                    title="Add new filter tag"
                  >
                    <Plus size={14} />
                  </button>
                </div>
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
        {/* Add Tag Modal */}
        {showTagModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTagModal(false)}
            style={{ animation: 'fadeIn 0.2s ease' }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal Card */}
            <div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {/* Top Accent Bar */}
              <div className="h-1 w-full bg-gradient-to-r from-[#FF6A00] via-[#FF8C38] to-[#FF6A00]" />

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF8C38] flex items-center justify-center shadow-lg">
                      <Tag size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-marcellus text-lg font-semibold text-[#1A1A1A]">New Filter Tag</h3>
                      <p className="text-[10px] text-[#6E6E6E] font-poppins uppercase tracking-wider">Create a custom gallery category</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTagModal(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Input */}
                <div className="mb-2">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-poppins">Tag Name</label>
                  <input
                    ref={modalTagInputRef}
                    type="text"
                    value={modalTagName}
                    onChange={(e) => { setModalTagName(e.target.value); setModalTagError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleModalAddTag(); if (e.key === 'Escape') setShowTagModal(false); }}
                    placeholder="e.g. Block Printing, Zari Work…"
                    className={`w-full px-4 py-3.5 border rounded-xl text-sm focus:outline-none bg-[#FAF9F6] font-poppins transition-all ${
                      modalTagError
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-[#FF6A00] focus:shadow-[0_0_0_3px_rgba(255,106,0,0.08)]'
                    }`}
                  />
                  {modalTagError && (
                    <p className="text-[10px] text-red-500 mt-1.5 font-poppins font-medium">{modalTagError}</p>
                  )}
                </div>

                {/* Preview */}
                {modalTagName.trim() && !modalTagError && (
                  <div className="flex items-center gap-2 mb-5 mt-3">
                    <span className="text-[10px] text-[#6E6E6E] font-poppins uppercase tracking-wider">Preview:</span>
                    <span className="px-3 py-1 rounded-full bg-[#1A1A1A] text-white text-[10px] font-semibold uppercase tracking-wider">
                      {modalTagName.trim()}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowTagModal(false)}
                    className="flex-1 px-5 py-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 cursor-pointer transition-all font-poppins uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleModalAddTag}
                    disabled={!modalTagName.trim()}
                    className="flex-1 px-5 py-3 bg-[#1A1A1A] text-white rounded-xl text-xs font-semibold hover:bg-[#FF6A00] cursor-pointer transition-all flex items-center justify-center gap-2 font-poppins uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  >
                    <Plus size={14} /> Create Tag
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
