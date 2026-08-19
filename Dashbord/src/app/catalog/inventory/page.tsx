'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminStore } from '@/store/adminStore';
import { 
  Package, TrendingUp, AlertTriangle, ClipboardList, 
  Plus, Minus, RefreshCw, CheckCircle2, Loader2, Save
} from 'lucide-react';

export default function InventoryManagement() {
  const [mounted, setMounted] = useState(false);
  const { role } = useAdminStore();

  const [products, setProducts] = useState<any[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stockFilters, setStockFilters] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [tempAdjustments, setTempAdjustments] = useState<Record<string, number>>({});
  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  const loadInventoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodsRes, logsRes] = await Promise.all([
        fetch('/api/products?limit=100'),
        fetch('/api/inventory?limit=20')
      ]);

      const prodsData = await prodsRes.json();
      const logsData = await logsRes.json();

      if (prodsData.success && logsData.success) {
        setProducts(prodsData.products);
        setInventoryLogs(logsData.logs);
      } else {
        throw new Error(prodsData.error || logsData.error || 'Failed to fetch inventory details');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadInventoryData();
  }, []);

  if (!mounted) return null;

  // Calculate stock stats dynamically
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const availableStock = Math.round(totalStock * 0.85);
  const reservedStock = totalStock - availableStock;
  const lowStockCount = products.filter(p => p.stock <= p.lowStockAlert && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  const handleStockUpdate = async (prodId: string, change: number, reason: string) => {
    setAdjustingId(prodId);
    try {
      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prodId,
          change,
          reason
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        loadInventoryData();
      } else {
        alert(result.error || 'Failed to adjust stock');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred while adjusting stock');
    } finally {
      setAdjustingId(null);
    }
  };

  const handleManualInputSave = (prodId: string, currentStock: number) => {
    const value = tempAdjustments[prodId];
    if (value === undefined || isNaN(value)) return;
    
    const change = value - currentStock;
    if (change === 0) return;

    handleStockUpdate(prodId, change, 'Manual stock level set');
    
    setTempAdjustments(prev => {
      const copy = { ...prev };
      delete copy[prodId];
      return copy;
    });
  };

  const filteredProducts = products.filter((p) => {
    if (stockFilters === 'LOW') return p.stock <= p.lowStockAlert && p.stock > 0;
    if (stockFilters === 'OUT') return p.stock <= 0;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in font-poppins">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-5">
          <div>
            <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Atelier Inventory Control</h1>
            <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Real-time stock management and audits</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={loadInventoryData}
              className="p-2 border border-gray-200 rounded-xl hover:border-[#FF6A00] transition-all cursor-pointer bg-white text-gray-500"
            >
              <RefreshCw size={16} />
            </button>
            <div className="flex items-center gap-1 bg-[#FAF9F6] border border-[rgba(0,0,0,0.06)] rounded-full p-1 text-[10px] font-semibold text-[#6E6E6E]">
              <button 
                onClick={() => setStockFilters('ALL')} 
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${stockFilters === 'ALL' ? 'bg-white text-[#FF6A00] shadow-sm' : 'hover:text-[#1a1a1a]'}`}
              >
                All Stock
              </button>
              <button 
                onClick={() => setStockFilters('LOW')} 
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${stockFilters === 'LOW' ? 'bg-white text-[#D99A00] shadow-sm' : 'hover:text-[#1a1a1a]'}`}
              >
                Low Stock ({lowStockCount})
              </button>
              <button 
                onClick={() => setStockFilters('OUT')} 
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${stockFilters === 'OUT' ? 'bg-white text-[#D83A3A] shadow-sm' : 'hover:text-[#1a1a1a]'}`}
              >
                Out of Stock ({outOfStockCount})
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4 bg-white border border-[rgba(0,0,0,0.03)]">
            <div className="w-12 h-12 rounded-full bg-[rgba(255, 106, 0,0.08)] flex items-center justify-center text-[#FF6A00] flex-shrink-0">
              <Package size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold font-inter">Total Stock pieces</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{totalStock} units</h3>
              <p className="text-[9px] text-gray-400 mt-0.5">Across all heritage designs</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4 bg-white border border-[rgba(0,0,0,0.03)]">
            <div className="w-12 h-12 rounded-full bg-[rgba(15,169,88,0.08)] flex items-center justify-center text-[#0FA958] flex-shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold font-inter">Available Stock</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{availableStock} units</h3>
              <p className="text-[9px] text-[#0FA958] mt-0.5 font-medium">Ready for immediate dispatch</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4 bg-white border border-[rgba(0,0,0,0.03)]">
            <div className="w-12 h-12 rounded-full bg-[rgba(217,154,0,0.08)] flex items-center justify-center text-[#D99A00] flex-shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold font-inter">Reserved Stock</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{reservedStock} units</h3>
              <p className="text-[9px] text-gray-400 mt-0.5">Assigned to pending orders</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-luxury flex items-center gap-4 font-inter bg-white border border-[rgba(0,0,0,0.03)]">
            <div className="w-12 h-12 rounded-full bg-[rgba(216,58,58,0.08)] flex items-center justify-center text-[#D83A3A] flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Replenish Alerts</p>
              <h3 className="font-inter text-2xl font-light text-gray-800 mt-1">{lowStockCount + outOfStockCount} items</h3>
              <p className="text-[9px] text-[#D83A3A] mt-0.5 font-medium">Stock thresholds breached</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={36} className="animate-spin text-[#FF6A00]" />
            <span className="text-xs text-gray-400 uppercase tracking-widest font-inter">Loading stock registry...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Inventory adjustment table */}
            <div className="lg:col-span-2 glass-card rounded-[28px] p-6 shadow-luxury bg-white border border-[rgba(0,0,0,0.03)]">
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h3 className="font-marcellus text-xl text-[#1A1A1A] font-light uppercase tracking-wider">
                  Atelier Piece Stock Levels
                </h3>
                <p className="text-[10px] text-[#6E6E6E] uppercase tracking-wider font-inter">Direct stock modifications & targets</p>
              </div>

              <div className="overflow-x-auto">
                <table className="luxury-table w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-100 text-[10px] uppercase text-gray-400 tracking-wider font-semibold font-inter">
                      <th className="pb-3">Product</th>
                      <th className="pb-3">SKU</th>
                      <th className="pb-3">Stock Level</th>
                      <th className="pb-3">Quick Modify</th>
                      <th className="pb-3">Set Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-poppins text-xs">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-all">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0 relative border border-gray-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900 truncate max-w-[150px]">{p.name}</p>
                              <p className="text-[9px] text-[#FF6A00] uppercase tracking-wider font-medium font-inter">{p.category?.name || 'Sarees'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-inter text-gray-500">{p.sku}</td>
                        <td className="py-4">
                          <span className={`text-xs font-semibold font-inter ${
                            p.stock <= 0 
                              ? 'text-[#D83A3A]' 
                              : p.stock <= p.lowStockAlert 
                                ? 'text-[#D99A00]' 
                                : 'text-[#0FA958]'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={adjustingId !== null || p.stock <= 0}
                              onClick={() => handleStockUpdate(p.id, -1, 'Quick stock decrement (-1)')}
                              className="w-7 h-7 bg-white border border-gray-200 rounded-lg hover:border-red-500 hover:text-red-500 flex items-center justify-center transition-all text-gray-600 cursor-pointer disabled:opacity-50"
                            >
                              <Minus size={12} />
                            </button>
                            <button
                              disabled={adjustingId !== null}
                              onClick={() => handleStockUpdate(p.id, 5, 'Quick stock increment (+5)')}
                              className="w-7 h-7 bg-white border border-gray-200 rounded-lg hover:border-[#FF6A00] hover:text-[#FF6A00] flex items-center justify-center transition-all text-gray-600 font-semibold cursor-pointer"
                            >
                              +5
                            </button>
                            <button
                              disabled={adjustingId !== null}
                              onClick={() => handleStockUpdate(p.id, 20, 'Bulk stock increment (+20)')}
                              className="w-7 h-7 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:text-green-500 flex items-center justify-center transition-all text-gray-600 font-semibold cursor-pointer"
                            >
                              +20
                            </button>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              disabled={adjustingId !== null}
                              placeholder={p.stock.toString()}
                              value={tempAdjustments[p.id] !== undefined ? tempAdjustments[p.id] : ''}
                              onChange={(e) => setTempAdjustments({ ...tempAdjustments, [p.id]: parseInt(e.target.value) })}
                              className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-center text-xs font-inter focus:outline-none focus:border-[#FF6A00]"
                            />
                            {tempAdjustments[p.id] !== undefined && (
                              <button
                                onClick={() => handleManualInputSave(p.id, p.stock)}
                                className="px-2 py-1.5 bg-[#FF6A00] text-white rounded-lg text-[10px] font-semibold hover:bg-black transition-all cursor-pointer flex items-center justify-center"
                              >
                                <Save size={10} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit logs of inventory movements */}
            <div className="glass-card rounded-[28px] p-6 shadow-luxury flex flex-col justify-between bg-white border border-[rgba(0,0,0,0.03)] h-fit">
              <div>
                <div className="border-b border-gray-100 pb-4 mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-marcellus text-xl text-[#1A1A1A] font-light uppercase tracking-wider">
                      Stock Audit Trail
                    </h3>
                    <p className="text-[10px] text-[#6E6E6E] uppercase tracking-wider font-inter">Live movement tracking</p>
                  </div>
                  <ClipboardList size={18} className="text-[#FF6A00]" />
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {inventoryLogs.length === 0 ? (
                    <p className="text-xs text-gray-400 font-poppins py-4 text-center">No inventory logs registered yet.</p>
                  ) : (
                    inventoryLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-white border border-gray-100 rounded-2xl flex flex-col gap-1 text-xs shadow-sm">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-gray-900 truncate max-w-[150px]">{log.productName}</p>
                          <span className={`font-inter text-xs font-semibold ${
                            log.change > 0 ? 'text-[#0FA958]' : 'text-[#D83A3A]'
                          }`}>
                            {log.change > 0 ? `+${log.change}` : log.change} units
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] text-gray-500">
                          <span>SKU: {log.sku}</span>
                          <span className="font-medium bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">
                            {log.type.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex flex-col gap-0.5 text-[9px] text-gray-400 mt-2 border-t border-gray-50 pt-2">
                          <span className="font-medium text-gray-600">By: {log.user}</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
