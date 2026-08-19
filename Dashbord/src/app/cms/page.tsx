'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Sliders, Save, Image, Sparkles, Globe, Megaphone, Plus, Trash2, Edit2, Upload } from 'lucide-react';

export default function CMSEditor() {
  const [mounted, setMounted] = useState(false);
  const [cms, setCms] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Local Form state
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  
  // Gallery configurations
  const [gallery, setGallery] = useState<any[]>([]);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('');
  const [galleryFilterTag, setGalleryFilterTag] = useState<'weaving' | 'embroidery' | 'coloring' | 'finishing'>('weaving');
  const [galleryImage, setGalleryImage] = useState('');
  const [galleryDesc, setGalleryDesc] = useState('');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const galleryFileInputRef = React.useRef<HTMLInputElement>(null);

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
    const item = gallery[index];
    setEditingIndex(index);
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
    const fetchCms = async () => {
      try {
        const res = await fetch('/api/cms');
        const data = await res.json();
        if (data.success && data.cms) {
          setCms(data.cms);
          setHeroTitle(data.cms.heroTitle || '');
          setHeroSubtitle(data.cms.heroSubtitle || '');
          setHeroImage(data.cms.heroImage || '');
          setAnnouncementText(data.cms.announcementText || '');
          setAnnouncementLink(data.cms.announcementLink || '');
          setAnnouncementActive(data.cms.announcementActive || false);
          setSeoTitle(data.cms.seoTitle || '');
          setSeoDescription(data.cms.seoDescription || '');
          setGallery(data.cms.gallery || []);
        }
      } catch (err) {
        console.error('Failed to load CMS configs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCms();
  }, []);

  if (!mounted || loading || !cms) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF6A00]"></div>
        </div>
      </AdminLayout>
    );
  }

  const handleSaveCMS = async (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await fetch('/api/cms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroTitle,
          heroSubtitle,
          heroImage,
          announcementText,
          announcementLink,
          announcementActive,
          seoTitle,
          seoDescription,
          gallery
        })
      });
      const data = await res.json();
      if (data.success) {
        setCms(data.cms);
        alert('Homepage CMS parameters published successfully.');
      } else {
        alert(data.error || 'Failed to update CMS config');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating CMS config');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-5">
          <div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Homepage & CMS Editor</h1>
            <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Configure user storefront banners and SEO metadata</p>
          </div>
          <button
            onClick={handleSaveCMS}
            className="px-5 py-3 bg-[#1A1A1A] text-white rounded-[16px] text-xs font-semibold hover:bg-[#FF6A00] transition-all flex items-center gap-2 shadow-md uppercase tracking-wider"
          >
            <Save size={14} /> Publish Changes
          </button>
        </div>

        <form onSubmit={handleSaveCMS} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main CMS Editor Panel (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Announcement bar editor */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h3 className="font-marcellus text-lg text-gray-800 uppercase tracking-wider flex items-center gap-2 font-light">
                  <Megaphone size={18} className="text-[#FF6A00]" /> Announcement Bar
                </h3>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={announcementActive}
                    onChange={(e) => setAnnouncementActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6A00]"></div>
                  <span className="ml-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2">Announcement Message Text</label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="e.g. Free shipping on all domestic orders."
                    className="w-full px-4 py-3 border border-gray-200 rounded-[12px] text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2">Redirect Action Link</label>
                  <input
                    type="text"
                    value={announcementLink}
                    onChange={(e) => setAnnouncementLink(e.target.value)}
                    placeholder="/shop/new-arrivals"
                    className="w-full px-4 py-3 border border-gray-200 rounded-[12px] text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>
            </div>

            {/* Homepage Hero Editor */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-4">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-marcellus text-lg text-gray-800 uppercase tracking-wider flex items-center gap-2 font-light">
                  <Image size={18} className="text-[#FF6A00]" /> Hero Banner Section
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2">Main Headline Heading</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-[12px] text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2">Sub-headline text</label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-[12px] text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2">Banner Background Image URL</label>
                  <input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-[12px] text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>
            </div>

            {/* Gallery Exhibition Section */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-6">
              <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
                <h3 className="font-marcellus text-lg text-gray-800 uppercase tracking-wider flex items-center gap-2 font-light">
                  <Image size={18} className="text-[#FF6A00]" /> Artisan Exhibition Gallery
                </h3>
                <button
                  type="button"
                  onClick={handleAddNewItemClick}
                  className="px-4 py-2 bg-[#1A1A1A] text-white rounded-xl text-xs font-semibold hover:bg-[#FF6A00] transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer font-poppins"
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>

              {/* Add/Edit Gallery Item Form */}
              {isEditingItem && (
                <div className="border border-[rgba(255, 106, 0,0.25)] rounded-2xl p-5 bg-[#FAF9F6] space-y-4 font-poppins">
                  <h4 className="font-marcellus text-sm font-semibold text-gray-800 uppercase tracking-wide">
                    {editingIndex !== null ? "Edit Gallery Exhibition Card" : "New Gallery Exhibition Card"}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Card Title</label>
                      <input
                        type="text"
                        value={galleryTitle}
                        onChange={(e) => setGalleryTitle(e.target.value)}
                        placeholder="e.g. Master Silk Weaver"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6A00] bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Display Category</label>
                      <input
                        type="text"
                        value={galleryCategory}
                        onChange={(e) => setGalleryCategory(e.target.value)}
                        placeholder="e.g. Artisanal Handloom"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6A00] bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Filter Tag Category</label>
                      <select
                        value={galleryFilterTag}
                        onChange={(e) => setGalleryFilterTag(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6A00] text-gray-700 bg-white font-poppins"
                      >
                        <option value="weaving">Weaving Studio</option>
                        <option value="embroidery">Intricate Embroidery</option>
                        <option value="coloring">Organic Coloring</option>
                        <option value="finishing">Artisanal Finishing</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Upload Card Image</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={galleryImage}
                          onChange={(e) => setGalleryImage(e.target.value)}
                          placeholder="Paste URL or upload image file"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6A00] bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => galleryFileInputRef.current?.click()}
                          className="px-3 bg-gray-150 hover:bg-[#FF6A00] hover:text-white rounded-lg text-xs transition-all border border-gray-200 cursor-pointer flex items-center justify-center text-gray-700 hover:text-white"
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
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Short Narrative Description</label>
                    <textarea
                      rows={2}
                      value={galleryDesc}
                      onChange={(e) => setGalleryDesc(e.target.value)}
                      placeholder="Narrate the craftsmanship story behind this stage..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6A00] bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingItem(false)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveGalleryItem}
                      className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg text-xs font-semibold hover:bg-[#FF6A00] cursor-pointer"
                    >
                      Save Card
                    </button>
                  </div>
                </div>
              )}

              {/* Gallery Items Grid List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-poppins">
                {gallery.map((item, idx) => (
                  <div key={item.id || idx} className="relative group border border-gray-150 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col justify-between hover:border-[#FF6A00] transition-all">
                    <div className="relative h-28 bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleEditGalleryItem(idx)}
                          className="p-1.5 bg-white text-gray-700 rounded-full shadow hover:bg-[#FF6A00] hover:text-white cursor-pointer"
                          title="Edit Card"
                        >
                          <Edit2 size={10} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                          className="p-1.5 bg-white text-red-600 rounded-full shadow hover:bg-red-600 hover:text-white cursor-pointer"
                          title="Remove Card"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                      <span className="absolute bottom-2 left-2 text-[9px] uppercase tracking-wider font-semibold bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-[2px]">
                        {item.filterTag}
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      <span className="text-[8px] uppercase tracking-widest text-[#FF6A00] font-bold block">{item.category}</span>
                      <h5 className="font-semibold text-gray-800 text-xs truncate" title={item.title}>{item.title}</h5>
                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search & SEO settings */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-4">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-marcellus text-lg text-gray-800 uppercase tracking-wider flex items-center gap-2 font-light">
                  <Globe size={18} className="text-[#FF6A00]" /> Search Engine Optimization (SEO)
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2">Google SEO Page Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-[12px] text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2">Meta Description Text</label>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-[12px] text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visual Previews Column (Col 3) */}
          <div className="space-y-8">
            {/* Live Front-End Card Preview */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-4">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-marcellus text-lg text-gray-800 uppercase tracking-wider flex items-center gap-2 font-light">
                  <Sparkles size={16} className="text-[#FF6A00] animate-pulse" /> Shop Front Live Preview
                </h3>
                <p className="text-[9px] text-[#6E6E6E] uppercase mt-0.5 font-poppins">Mimicking customer landing view</p>
              </div>

              {/* Faux Front-End Frame */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-md font-poppins bg-[#FAF9F6] relative">
                {/* Faux announcement */}
                {announcementActive && (
                  <div className="bg-[#FF6A00] text-white text-[9px] py-1 text-center font-semibold tracking-wider px-2">
                    {announcementText || 'Atelier Booking Alert active'}
                  </div>
                )}

                {/* Faux header */}
                <div className="h-12 bg-white px-4 border-b border-gray-100 flex items-center justify-between text-[10px] tracking-wider uppercase font-semibold text-gray-800">
                  <span className="font-marcellus">Designs of Dreams</span>
                  <div className="flex gap-3 text-gray-400">
                    <span>Shop</span>
                    <span>Couture</span>
                    <span>Artisans</span>
                  </div>
                </div>

                {/* Faux Banner */}
                <div className="h-44 bg-gray-900 relative flex items-center justify-center text-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600'}
                    alt="Banner"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="relative z-10 text-white space-y-1 max-w-xs">
                    <h4 className="font-marcellus text-sm font-light uppercase tracking-widest truncate">{heroTitle || 'Collection Title'}</h4>
                    <p className="text-[8px] text-gray-200 font-light leading-relaxed line-clamp-2">{heroSubtitle || 'Subtitle description'}</p>
                    <button type="button" className="bg-white text-gray-900 px-3 py-1 rounded text-[7px] font-bold uppercase tracking-wider hover:bg-[#FF6A00] hover:text-white transition-all mt-2">
                      Explore Atelier
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured collections list */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-4">
              <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Featured Collections Order</h4>
              <div className="space-y-3">
                {cms.featuredCollections.map((col: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-[#FAF9F6] border border-gray-100 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={col.image} alt={col.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-semibold text-gray-800">{col.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-inter font-semibold">{col.count} items</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
