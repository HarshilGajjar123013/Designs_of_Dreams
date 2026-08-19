'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminStore } from '@/store/adminStore';
import { 
  Search, Filter, Plus, Edit2, Trash2, X, Upload, Check, 
  Image as ImageIcon, Video, Eye, Tag, AlertTriangle, Layers, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductCatalog() {
  const [mounted, setMounted] = useState(false);
  const { role } = useAdminStore();
  
  // Data loading states
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'pricing' | 'weave' | 'media'>('info');

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [mrp, setMrp] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [gst, setGst] = useState(5);
  const [stock, setStock] = useState(5);
  const [lowStockAlert, setLowStockAlert] = useState(2);
  const [description, setDescription] = useState('');
  const [fabric, setFabric] = useState('');
  const [weaveType, setWeaveType] = useState('');
  const [occasion, setOccasion] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>(['Free Size']);
  const [features, setFeatures] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ACTIVE');
  const [featured, setFeatured] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [premium, setPremium] = useState(true);
  const [newArrival, setNewArrival] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  // Custom specification details
  const [sareeLength, setSareeLength] = useState('');
  const [blousePiece, setBlousePiece] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [origin, setOrigin] = useState('');

  // Temp form states
  const [tempTag, setTempTag] = useState('');
  const [tempFeature, setTempFeature] = useState('');
  const [tempColor, setTempColor] = useState('#FF6A00');
  const [thumbnailIndex, setThumbnailIndex] = useState<number>(0);
  const [hoverIndex, setHoverIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hidden file input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load functions
  const loadCatalogData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load categories & collections first
      const [catsRes, collsRes, prodsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/collections'),
        fetch(`/api/products?limit=100`)
      ]);

      const catsData = await catsRes.json();
      const collsData = await collsRes.json();
      const prodsData = await prodsRes.json();

      if (catsData.success) setCategories(catsData.categories);
      if (collsData.success) setCollections(collsData.collections);
      if (prodsData.success) {
        setProducts(prodsData.products);
      } else {
        throw new Error(prodsData.error || 'Failed to load products');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadCatalogData();
  }, []);

  // Pre-fill form when editing
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setSku(editingProduct.sku);
      setCategoryId(editingProduct.categoryId);
      setSubCategory(editingProduct.subCategory);
      setCollectionId(editingProduct.collectionId || '');
      setMrp(editingProduct.mrp);
      setSellingPrice(editingProduct.sellingPrice);
      setDiscount(editingProduct.discount);
      setGst(editingProduct.gst);
      setStock(editingProduct.stock);
      setLowStockAlert(editingProduct.lowStockAlert);
      setDescription(editingProduct.description);
      setFabric(editingProduct.fabric);
      setWeaveType(editingProduct.weaveType);
      setOccasion(editingProduct.occasion);
      setColors(editingProduct.colors || []);
      setSizes(editingProduct.sizes || ['Free Size']);
      setFeatures(editingProduct.features || []);
      setTags(editingProduct.tags || []);
      setStatus(editingProduct.status);
      setFeatured(editingProduct.featured);
      setBestSeller(editingProduct.bestSeller);
      setPremium(editingProduct.premium);
      setNewArrival(editingProduct.newArrival);
      setUploadedImages(editingProduct.images || []);
      setVideoUrl(editingProduct.videoUrl || '');
      setSareeLength(editingProduct.sareeLength || '');
      setBlousePiece(editingProduct.blousePiece || '');
      setCareInstructions(editingProduct.careInstructions || '');
      setOrigin(editingProduct.origin || '');
      setThumbnailIndex(0);
      setHoverIndex((editingProduct.images && editingProduct.images.length > 1) ? 1 : 0);
    } else {
      // Default new product values
      setName('');
      setSku(`DOD-SAR-${Math.floor(Math.random() * 900) + 100}`);
      setCategoryId(categories[0]?.id || '');
      setSubCategory('');
      setCollectionId('');
      setMrp(0);
      setSellingPrice(0);
      setDiscount(0);
      setGst(5);
      setStock(5);
      setLowStockAlert(2);
      setDescription('');
      setFabric('');
      setWeaveType('');
      setOccasion('');
      setColors(['#FF6A00']);
      setSizes(['Free Size']);
      setFeatures([]);
      setTags([]);
      setStatus('ACTIVE');
      setFeatured(false);
      setBestSeller(false);
      setPremium(true);
      setNewArrival(true);
      setUploadedImages([
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600'
      ]);
      setVideoUrl('');
      setSareeLength('5.5 Meters');
      setBlousePiece('0.8 Meters (Unstitched Included)');
      setCareInstructions('Dry Clean Only (Store in Muslin Bag)');
      setOrigin('India (Varanasi, UP)');
      setThumbnailIndex(0);
      setHoverIndex(0);
    }
  }, [editingProduct, drawerOpen, categories]);

  // Dynamic Discount calculation
  useEffect(() => {
    if (mrp > 0 && sellingPrice > 0) {
      const disc = Math.round(((mrp - sellingPrice) / mrp) * 100);
      setDiscount(disc > 0 ? disc : 0);
    } else {
      setDiscount(0);
    }
  }, [mrp, sellingPrice]);

  if (!mounted) return null;

  // Filter products locally for search / quick filters
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || p.categoryId === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setDrawerOpen(true);
    setActiveTab('info');
  };

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product);
    setDrawerOpen(true);
    setActiveTab('info');
  };

  const handleArchiveDelete = async (product: any) => {
    if (!confirm(`Are you sure you want to delete ${product.name}?`)) return;

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== product.id));
      } else {
        const res = await response.json();
        alert(res.error || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred while deleting product');
    }
  };

  // Real file upload handler
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Client-side validation
    const maxSize = 4 * 1024 * 1024; // 4MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        alert(`Invalid file type: ${file.name}. Only JPEG, PNG, WEBP, AVIF allowed.`);
        return;
      }
      if (file.size > maxSize) {
        alert(`File "${file.name}" exceeds 4MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        return;
      }
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      fileArray.forEach((file) => formData.append('files', file));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok && result.success) {
        const newUrls = result.images.map((img: { url: string }) => img.url);
        setUploadedImages((prev) => [...prev, ...newUrls]);
      } else {
        alert(result.error || 'Upload failed. Please check your Cloudinary configuration.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Network error during upload. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input so re-selecting the same file works
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Click handler to open file picker
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || mrp <= 0 || sellingPrice <= 0 || !categoryId) {
      alert('Please fill all critical fields (Name, SKU, Category, MRP, Selling Price)');
      return;
    }

    setSaving(true);

    const finalImages = [...uploadedImages];
    if (finalImages.length > 0) {
      const thumb = finalImages[thumbnailIndex];
      finalImages.splice(thumbnailIndex, 1);
      finalImages.unshift(thumb);
    }

    const payload = {
      name,
      sku,
      categoryId,
      subCategory,
      collectionId: collectionId || null,
      mrp: Number(mrp),
      sellingPrice: Number(sellingPrice),
      discount: Number(discount),
      gst: Number(gst),
      stock: Number(stock),
      lowStockAlert: Number(lowStockAlert),
      description,
      fabric,
      weaveType,
      occasion,
      colors,
      sizes,
      features,
      tags,
      status,
      featured,
      bestSeller,
      premium,
      newArrival,
      images: finalImages,
      videoUrl: videoUrl || null,
      sareeLength: sareeLength || null,
      blousePiece: blousePiece || null,
      careInstructions: careInstructions || null,
      origin: origin || null
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh products list
        loadCatalogData();
        setDrawerOpen(false);
      } else {
        if (result.details) {
          const errors = Object.entries(result.details)
            .filter(([key]) => key !== '_errors')
            .map(([key, val]: [string, any]) => {
              const fieldErrors = val._errors || [];
              return `${key}: ${fieldErrors.join(', ')}`;
            })
            .join('\n');
          alert(`Validation Failed:\n${errors}`);
        } else {
          alert(result.error || 'Failed to save product details');
        }
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving product details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
          <div>
            <h1 className="font-marcellus text-3xl font-light text-text-primary">Product Catalog</h1>
            <p className="text-xs text-text-secondary font-poppins uppercase tracking-wider mt-1">Atelier Ethnic Wear Collection</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-3 bg-text-primary text-white rounded-2xl text-xs font-semibold hover:bg-luxury-gold transition-all flex items-center gap-2 shadow-md uppercase tracking-wider cursor-pointer"
          >
            <Plus size={14} /> New Couture Piece
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-xs text-red-600">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by Name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-border-lux rounded-2xl text-xs font-poppins focus:outline-none focus:border-luxury-gold shadow-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3.5 bg-white border border-border-lux rounded-2xl text-xs font-poppins focus:outline-none focus:border-luxury-gold text-gray-700 shadow-sm"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={36} className="animate-spin text-luxury-gold" />
            <span className="text-xs text-gray-400 font-poppins uppercase tracking-widest">Syncing Atelier Catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-border-lux rounded-3xl">
            <Layers size={40} className="text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-800">No products found</p>
            <p className="text-xs text-gray-500 mt-1">Try updating your filters or add a new piece.</p>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                className="glass-card rounded-3xl border border-[rgba(0,0,0,0.04)] shadow-luxury overflow-hidden flex flex-col justify-between hover:border-luxury-gold transition-all duration-300 bg-white"
              >
                {/* Image Preview & Badges */}
                <div className="relative h-64 bg-gray-50 overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  
                  {/* Overlay tags */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
                    {p.premium && (
                      <span className="text-[8px] font-semibold uppercase tracking-widest bg-text-primary text-white px-2 py-0.5 rounded">
                        Premium
                      </span>
                    )}
                    {p.bestSeller && (
                      <span className="text-[8px] font-semibold uppercase tracking-widest bg-luxury-gold text-white px-2 py-0.5 rounded">
                        Best Seller
                      </span>
                    )}
                    {p.newArrival && (
                      <span className="text-[8px] font-semibold uppercase tracking-widest bg-brand-orange text-white px-2 py-0.5 rounded">
                        New
                      </span>
                    )}
                  </div>

                  {/* Edit/Delete overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 z-10">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-luxury-gold hover:text-white transition-all shadow-md cursor-pointer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleArchiveDelete(p)}
                      className="p-2.5 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-md cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Info Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-inter">
                      <span>{p.sku}</span>
                      <span className="font-semibold text-luxury-gold uppercase">{p.category?.name || 'Saree'}</span>
                    </div>
                    <h4 className="font-marcellus text-base text-gray-900 font-light truncate" title={p.name}>
                      {p.name}
                    </h4>
                  </div>

                  {/* Price and Stock levels */}
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-gray-400 line-through font-inter">
                        ₹{p.mrp.toLocaleString()}
                      </span>
                      <p className="font-inter text-base font-bold text-gray-900">
                        ₹{p.sellingPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-medium">Stock status</span>
                      <span className={`text-[10px] font-semibold font-inter ${
                        p.stock <= 0 
                          ? 'text-error-lux' 
                          : p.stock <= p.lowStockAlert 
                            ? 'text-warning-lux' 
                            : 'text-success-lux'
                      }`}>
                        {p.stock} units
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* DRAWER CONTAINER */}
        <AnimatePresence>
          {drawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
                className="absolute inset-0 bg-black"
              />

              {/* Slider panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-2xl bg-white h-full relative shadow-2xl flex flex-col z-10"
              >
                {/* Header */}
                <div className="h-20 border-b border-gray-100 flex items-center justify-between px-8">
                  <h3 className="font-marcellus text-xl font-light text-gray-800 uppercase tracking-wider">
                    {editingProduct ? 'Edit Couture details' : 'Add New Couture Piece'}
                  </h3>
                  <button 
                    onClick={() => setDrawerOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-500 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Sub-header Tabs */}
                <div className="flex border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50">
                  {(['info', 'pricing', 'weave', 'media'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-4 border-b-2 transition-all cursor-pointer ${
                        activeTab === tab
                          ? 'border-luxury-gold text-luxury-gold bg-white'
                          : 'border-transparent hover:text-gray-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Scrollable Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                  {/* TAB 1: INFO */}
                  {activeTab === 'info' && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Couture Piece Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Patan Patola Double Ikat Saree"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">SKU Code</label>
                          <input
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            placeholder="DOD-SAR-XXX"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Category</label>
                          <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold text-gray-700 bg-white"
                          >
                            <option value="">Select a Category</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Sub Category</label>
                          <input
                            type="text"
                            value={subCategory}
                            onChange={(e) => setSubCategory(e.target.value)}
                            placeholder="e.g. Silk Sarees"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Collection</label>
                          <select
                            value={collectionId}
                            onChange={(e) => setCollectionId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold text-gray-700 bg-white"
                          >
                            <option value="">None / Heritage Evergreen</option>
                            {collections.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Description</label>
                        <textarea
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Tell the story of the artisan, weave origin and embroidery detail..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                        />
                      </div>

                      {/* Flags Checklist */}
                      <div className="border border-gray-100 p-4 rounded-2xl bg-bg-primary grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={premium}
                            onChange={(e) => setPremium(e.target.checked)}
                            className="rounded text-luxury-gold focus:ring-luxury-gold"
                          />
                          <span>Premium Collection</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={featured}
                            onChange={(e) => setFeatured(e.target.checked)}
                            className="rounded text-luxury-gold focus:ring-luxury-gold"
                          />
                          <span>Featured Product</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bestSeller}
                            onChange={(e) => setBestSeller(e.target.checked)}
                            className="rounded text-luxury-gold focus:ring-luxury-gold"
                          />
                          <span>Best Seller</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newArrival}
                            onChange={(e) => setNewArrival(e.target.checked)}
                            className="rounded text-luxury-gold focus:ring-luxury-gold"
                          />
                          <span>New Arrival</span>
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: PRICING */}
                  {activeTab === 'pricing' && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">MRP (Maximum Retail Price)</label>
                          <input
                            type="number"
                            value={mrp}
                            onChange={(e) => setMrp(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Selling Price (Atelier Price)</label>
                          <input
                            type="number"
                            value={sellingPrice}
                            onChange={(e) => setSellingPrice(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Discount (%)</label>
                          <input
                            type="number"
                            value={discount}
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins bg-bg-primary text-gray-500 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">GST Rate (%)</label>
                          <select
                            value={gst}
                            onChange={(e) => setGst(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          >
                            <option value={5}>5% (Handloom Base)</option>
                            <option value={12}>12% (Bespoke/Ready to Wear)</option>
                            <option value={18}>18% (Accessories/Other)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Current Stock</label>
                          <input
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Low Stock Threshold</label>
                          <input
                            type="number"
                            value={lowStockAlert}
                            onChange={(e) => setLowStockAlert(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: WEAVE / FABRIC DETAILS */}
                  {activeTab === 'weave' && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Fabric Type</label>
                          <input
                            type="text"
                            value={fabric}
                            onChange={(e) => setFabric(e.target.value)}
                            placeholder="e.g. Pure Georgette Silk"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Weave Mechanism</label>
                          <input
                            type="text"
                            value={weaveType}
                            onChange={(e) => setWeaveType(e.target.value)}
                            placeholder="e.g. Double Ikat Handloom"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Suitable Occasion</label>
                        <input
                          type="text"
                          value={occasion}
                          onChange={(e) => setOccasion(e.target.value)}
                          placeholder="e.g. Bridal Sangeet, Festive Gala"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Dimensions / Length</label>
                          <input
                            type="text"
                            value={sareeLength}
                            onChange={(e) => setSareeLength(e.target.value)}
                            placeholder="e.g. 5.5 Meters"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Blouse Piece Details</label>
                          <input
                            type="text"
                            value={blousePiece}
                            onChange={(e) => setBlousePiece(e.target.value)}
                            placeholder="e.g. 0.8 Meters (Unstitched Included)"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Care Instructions</label>
                          <input
                            type="text"
                            value={careInstructions}
                            onChange={(e) => setCareInstructions(e.target.value)}
                            placeholder="e.g. Dry Clean Only (Store in Muslin Bag)"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Country of Origin</label>
                          <input
                            type="text"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            placeholder="e.g. India (Varanasi, UP)"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          />
                        </div>
                      </div>

                      {/* Color swatches */}
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Color Palette Swatches</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {colors.map((c, idx) => (
                            <div 
                              key={idx} 
                              style={{ backgroundColor: c }}
                              className="w-8 h-8 rounded-full border border-gray-200 relative group flex items-center justify-center cursor-pointer"
                              onClick={() => setColors(colors.filter((_, i) => i !== idx))}
                            >
                              <span className="hidden group-hover:block text-[9px] bg-black text-white px-1.5 py-0.5 rounded absolute bottom-full mb-1">Remove</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={tempColor}
                            onChange={(e) => setTempColor(e.target.value)}
                            className="h-9 w-12 border border-gray-200 rounded-lg p-0.5"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!colors.includes(tempColor)) {
                                setColors([...colors, tempColor]);
                              }
                            }}
                            className="bg-bg-primary border border-gray-200 px-4 text-xs font-semibold rounded-lg hover:border-luxury-gold transition-all cursor-pointer"
                          >
                            Add Swatch
                          </button>
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Key Features</label>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {features.map((f, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1">
                              {f}
                              <button type="button" onClick={() => setFeatures(features.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 font-bold cursor-pointer">×</button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tempFeature}
                            onChange={(e) => setTempFeature(e.target.value)}
                            placeholder="e.g. Real Gold Zari, 6.5m length"
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (tempFeature.trim()) {
                                setFeatures([...features, tempFeature.trim()]);
                                setTempFeature('');
                              }
                            }}
                            className="bg-gray-100 px-4 text-xs font-semibold rounded-xl hover:bg-luxury-gold hover:text-white transition-all cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: MEDIA UPLOAD */}
                  {activeTab === 'media' && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-luxury-gold tracking-wider block mb-2 font-inter">Product Image Upload</span>
                        
                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleFileUpload(e.target.files);
                            }
                          }}
                        />
                        
                        {/* Drag and drop / click-to-browse zone */}
                        <div 
                          onClick={triggerFileInput}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          className="border-2 border-dashed border-gray-200 hover:border-luxury-gold transition-all rounded-lux-md p-8 flex flex-col items-center justify-center cursor-pointer bg-bg-primary text-center"
                        >
                          <Upload size={32} className="text-luxury-gold mb-3 stroke-[1.5]" />
                          <p className="text-xs font-semibold text-gray-800">
                            {isUploading ? 'Uploading images...' : 'Drag & Drop Images here, or Click to Browse'}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 font-poppins">Supports JPEG, PNG, WEBP, AVIF (Max 4MB each)</p>
                          
                          {isUploading && (
                            <div className="w-40 bg-gray-200 h-1 rounded-full mt-4 overflow-hidden relative">
                              <div className="bg-luxury-gold h-full absolute top-0 left-0 w-1/2 animate-[pulse_1s_infinite]" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image gallery selection panel */}
                      {uploadedImages.length > 0 && (
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Uploaded Gallery & Primary Selectors</label>
                          <div className="grid grid-cols-4 gap-4">
                            {uploadedImages.map((img, idx) => (
                              <div 
                                key={idx} 
                                className={`relative h-24 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                                  idx === thumbnailIndex 
                                    ? 'border-luxury-gold shadow-md scale-[1.02]' 
                                    : idx === hoverIndex 
                                      ? 'border-brand-orange' 
                                      : 'border-transparent'
                                  }`}
                                onClick={() => setThumbnailIndex(idx)}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
                                
                                {/* Label indicator */}
                                <div className="absolute bottom-1 left-1 right-1 flex justify-between z-10">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setThumbnailIndex(idx);
                                    }}
                                    className="bg-black/75 text-white text-[8px] uppercase tracking-wider px-1 py-0.5 rounded font-semibold"
                                  >
                                    Primary
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setHoverIndex(idx);
                                    }}
                                    className="bg-black/75 text-white text-[8px] uppercase tracking-wider px-1 py-0.5 rounded font-semibold"
                                  >
                                    Hover
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUploadedImages(uploadedImages.filter((_, i) => i !== idx));
                                  }}
                                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 cursor-pointer"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex gap-4 mt-3 text-[10px] text-gray-500 font-poppins">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-luxury-gold" /> Primary Thumbnail</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-brand-orange" /> Hover Image</span>
                          </div>
                        </div>
                      )}

                      {/* Video URL */}
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2 font-inter">Video Presentation URL (YouTube/Vimeo)</label>
                        <input
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="e.g. https://www.youtube.com/watch?v=atelier-weaving"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-luxury-gold"
                        />
                      </div>
                    </motion.div>
                  )}
                </form>

                {/* Footer buttons */}
                <div className="h-24 border-t border-gray-100 flex items-center justify-between px-8 bg-gray-50">
                  <div className="text-[10px] text-gray-400 font-poppins">
                    All inputs saved to persistent database
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDrawerOpen(false)}
                      className="px-5 py-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSubmit}
                      className="px-6 py-3 bg-text-primary text-white rounded-xl text-xs font-semibold hover:bg-luxury-gold transition-all shadow-md uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <Loader2 size={12} className="animate-spin" />}
                      {editingProduct ? 'Save Changes' : 'Create Couture Piece'}
                    </button>
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
