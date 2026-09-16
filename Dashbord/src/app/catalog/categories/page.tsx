'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Layers, Plus, Tag, RefreshCw, Folder, Trash2, Edit2, X, Loader2, AlertTriangle, Image as ImageIcon } from 'lucide-react';

export default function CategoryManagement() {
  const [mounted, setMounted] = useState(false);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit states
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editingSaving, setEditingSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catsRes, prodsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products?limit=500')
      ]);

      const catsData = await catsRes.json();
      const prodsData = await prodsRes.json();

      if (catsData.success && prodsData.success) {
        setCategories(catsData.categories);
        setProducts(prodsData.products);
      } else {
        throw new Error(catsData.error || prodsData.error || 'Failed to fetch categories data');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load categories catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  if (!mounted) return null;

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          image: imageUrl.trim() || undefined,
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setName('');
        setDescription('');
        setImageUrl('');
        loadData();
      } else {
        alert(result.error || 'Failed to create category');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while creating the category');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (cat: any) => {
    setEditingCat(cat);
    setEditName(cat.name || '');
    setEditDescription(cat.description || '');
    setEditImageUrl(cat.image || '');
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editName.trim()) return;

    setEditingSaving(true);
    try {
      const response = await fetch(`/api/categories/${editingCat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || undefined,
          image: editImageUrl.trim() || null,
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setEditingCat(null);
        loadData();
      } else {
        alert(result.error || 'Failed to update category');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating the category');
    } finally {
      setEditingSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    const activeProducts = products.filter(p => p.categoryId === cat.id && p.status !== 'ARCHIVED');
    if (activeProducts.length > 0) {
      alert(`Cannot delete "${cat.name}" because it contains ${activeProducts.length} active products. Reassign or delete those products first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete the category "${cat.name}"?`)) return;

    try {
      const response = await fetch(`/api/categories/${cat.id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (response.ok && result.success) {
        loadData();
      } else {
        alert(result.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the category');
    }
  };

  const getProductCountForCat = (catId: string) => {
    return products.filter(p => p.categoryId === catId && p.status !== 'ARCHIVED').length;
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in font-poppins">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-5">
          <div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Category Configurations</h1>
            <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Manage catalog categories and sub-classification matrices</p>
          </div>
          <button 
            onClick={loadData}
            className="p-2 border border-gray-200 rounded-xl hover:border-[#FF6A00] transition-all cursor-pointer bg-white text-gray-500"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-[16px] flex items-center gap-3 text-xs text-red-600">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={36} className="animate-spin text-[#FF6A00]" />
            <span className="text-xs text-gray-400 uppercase tracking-widest font-inter">Loading Categories...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Categories Grid (Col 1 & 2) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {categories.map((cat) => {
                  const count = getProductCountForCat(cat.id);
                  return (
                    <div 
                      key={cat.id} 
                      className="glass-card rounded-[24px] p-6 shadow-luxury flex flex-col justify-between min-h-[200px] bg-white border border-[rgba(0,0,0,0.03)] hover:border-[#FF6A00] transition-all relative group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                            />
                          ) : (
                            <span className="w-10 h-10 rounded-full bg-[rgba(255,106,0,0.08)] flex items-center justify-center text-[#FF6A00]">
                              <Folder size={18} />
                            </span>
                          )}
                          <div>
                            <h3 className="font-marcellus text-lg text-gray-950 font-light">{cat.name}</h3>
                            <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">{count} active items</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all absolute top-4 right-4">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 text-gray-400 hover:text-[#FF6A00] hover:bg-orange-50 rounded-lg transition-all cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-gray-50 pt-3 mt-4">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Description</span>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                          {cat.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Category Form (Col 3) */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-6 h-fit bg-white">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-marcellus text-lg text-gray-800 uppercase tracking-wider font-light flex items-center gap-1.5">
                  <Plus size={16} className="text-[#FF6A00]" /> Create New Category
                </h3>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1 font-inter">Category Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarees"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1 font-inter">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the styling or weaving origin of this category..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1 font-inter">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#1A1A1A] hover:bg-[#FF6A00] text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  Append Category
                </button>
              </form>
            </div>
          </div>
        )}

        {/* EDIT CATEGORY MODAL */}
        {editingCat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h3 className="font-marcellus text-lg text-gray-900 font-light flex items-center gap-2">
                  <Edit2 size={18} className="text-[#FF6A00]" /> Edit Category
                </h3>
                <button
                  onClick={() => setEditingCat(null)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1 font-inter">Category Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1 font-inter">Description</label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1 font-inter">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCat(null)}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editingSaving}
                    className="flex-1 bg-[#FF6A00] hover:bg-[#e05e00] text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {editingSaving ? <Loader2 size={12} className="animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
