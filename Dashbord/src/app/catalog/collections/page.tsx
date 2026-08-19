'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Layers, Plus, Gem, RefreshCw, Trash2, Loader2, AlertTriangle, Calendar } from 'lucide-react';

export default function CollectionManagement() {
  const [mounted, setMounted] = useState(false);
  
  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [season, setSeason] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [collsRes, prodsRes] = await Promise.all([
        fetch('/api/collections'),
        fetch('/api/products?limit=500')
      ]);

      const collsData = await collsRes.json();
      const prodsData = await prodsRes.json();

      if (collsData.success && prodsData.success) {
        setCollections(collsData.collections);
        setProducts(prodsData.products);
      } else {
        throw new Error(collsData.error || prodsData.error || 'Failed to fetch collections data');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  if (!mounted) return null;

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          season: season.trim() || undefined,
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setName('');
        setDescription('');
        setSeason('');
        loadData();
      } else {
        alert(result.error || 'Failed to create collection');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while creating the collection');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollection = async (coll: any) => {
    if (!confirm(`Are you sure you want to delete the collection "${coll.name}"? Products in this collection will remain but will be set to Evergreen heritage.`)) return;

    try {
      const response = await fetch(`/api/collections/${coll.id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (response.ok && result.success) {
        loadData();
      } else {
        alert(result.error || 'Failed to delete collection');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the collection');
    }
  };

  const getProductCountForColl = (collId: string) => {
    return products.filter(p => p.collectionId === collId && p.status !== 'ARCHIVED').length;
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in font-poppins">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-5">
          <div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Collection Configurations</h1>
            <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Manage seasonal coutures and themed collections</p>
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
            <span className="text-xs text-gray-400 uppercase tracking-widest font-inter">Loading Collections...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Collections Grid (Col 1 & 2) */}
            <div className="lg:col-span-2 space-y-6">
              {collections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-[rgba(0,0,0,0.06)] rounded-[24px]">
                  <Gem size={40} className="text-gray-300 mb-3" />
                  <p className="text-sm font-semibold text-gray-800">No collections defined</p>
                  <p className="text-xs text-gray-500 mt-1">All items will fall back to default heritage category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {collections.map((coll) => {
                    const count = getProductCountForColl(coll.id);
                    return (
                      <div 
                        key={coll.id} 
                        className="glass-card rounded-[24px] p-6 shadow-luxury flex flex-col justify-between h-[220px] bg-white border border-[rgba(0,0,0,0.03)] hover:border-[#FF6A00] transition-all relative group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="w-10 h-10 rounded-full bg-[rgba(255, 106, 0,0.08)] flex items-center justify-center text-[#FF6A00] mb-4">
                              <Gem size={18} />
                            </span>
                            <h3 className="font-marcellus text-lg text-gray-950 font-light">{coll.name}</h3>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                              <span className="bg-[#FAF9F6] border border-gray-100 px-2 py-0.5 rounded text-gray-600 font-semibold uppercase tracking-wider">{coll.season || 'Evergreen'}</span>
                              <span>•</span>
                              <span className="font-poppins tracking-wider font-semibold">{count} active products</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteCollection(coll)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer absolute top-4 right-4"
                            title="Delete Collection"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="border-t border-gray-50 pt-3 mt-4">
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Details</span>
                          <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                            {coll.description || 'No description provided for this collection.'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Collection Form (Col 3) */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury space-y-6 h-fit bg-white">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-marcellus text-lg text-gray-800 uppercase tracking-wider font-light flex items-center gap-1.5">
                  <Plus size={16} className="text-[#FF6A00]" /> Create Collection
                </h3>
              </div>

              <form onSubmit={handleAddCollection} className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1 font-inter">Collection Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bridal 2026"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1 font-inter">Season Label</label>
                  <input
                    type="text"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    placeholder="e.g. Autumn/Winter 2026"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1 font-inter">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the theme, fabrics, or designer notes..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#1A1A1A] hover:bg-[#FF6A00] text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  Append Collection
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
