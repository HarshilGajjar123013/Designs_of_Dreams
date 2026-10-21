'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Calculator,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Edit2,
  Eye,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Layers,
  Package,
  RefreshCw,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { CostBreakdownBar } from '@/components/cost-calculator/CostBreakdownBar';
import { CalculationDetailModal } from '@/components/cost-calculator/CalculationDetailModal';
import { DeleteConfirmModal } from '@/components/cost-calculator/DeleteConfirmModal';

interface CostCalculationRecord {
  id: string;
  productName: string;
  product_name?: string;
  quantity: number;
  fabricCost: number;
  fabric_cost?: number;
  threadCost: number;
  thread_cost?: number;
  materialCost: number;
  material_cost?: number;
  printingCost: number;
  printing_cost?: number;
  labourCost: number;
  labour_cost?: number;
  otherCost: number;
  other_cost?: number;
  totalCost: number;
  total_cost?: number;
  costPerPiece: number;
  cost_per_piece?: number;
  sellingPrice?: number | null;
  selling_price?: number | null;
  profitPerPiece?: number | null;
  profit_per_piece?: number | null;
  totalProfit?: number | null;
  total_profit?: number | null;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export default function CostCalculatorPage() {
  const [mounted, setMounted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Form Inputs
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [fabricCost, setFabricCost] = useState('');
  const [threadCost, setThreadCost] = useState('');
  const [materialCost, setMaterialCost] = useState('');
  const [printingCost, setPrintingCost] = useState('');
  const [labourCost, setLabourCost] = useState('');
  const [otherCost, setOtherCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Data & List State
  const [calculations, setCalculations] = useState<CostCalculationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Notifications
  const [selectedCalculation, setSelectedCalculation] = useState<CostCalculationRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CostCalculationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Helper to show auto-dismissing notifications
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Indian Rupee Currency Formatter
  const formatINR = (val: number | null | undefined, includeDecimals = false): string => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: includeDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Real-time Automatic Calculations
  const liveCalculations = useMemo(() => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const fabric = Math.max(0, parseFloat(fabricCost) || 0);
    const thread = Math.max(0, parseFloat(threadCost) || 0);
    const material = Math.max(0, parseFloat(materialCost) || 0);
    const printing = Math.max(0, parseFloat(printingCost) || 0);
    const labour = Math.max(0, parseFloat(labourCost) || 0);
    const other = Math.max(0, parseFloat(otherCost) || 0);

    const sellingRaw = sellingPrice.trim();
    const hasSelling = sellingRaw !== '' && !isNaN(parseFloat(sellingRaw));
    const selling = hasSelling ? Math.max(0, parseFloat(sellingRaw) || 0) : null;

    // Total Cost = Fabric + Thread + Material + Printing + Labour + Other
    const total = Math.round((fabric + thread + material + printing + labour + other + Number.EPSILON) * 100) / 100;

    // Cost Per Piece = Total Cost / Quantity
    const perPiece = qty > 0 ? Math.round(((total / qty) + Number.EPSILON) * 100) / 100 : 0;

    // Profit Per Piece = Selling Price Per Piece - Cost Per Piece
    const profitPiece = selling !== null ? Math.round(((selling - perPiece) + Number.EPSILON) * 100) / 100 : null;

    // Total Profit = Profit Per Piece * Quantity
    const totalProf = profitPiece !== null ? Math.round(((profitPiece * qty) + Number.EPSILON) * 100) / 100 : null;

    // Margin percentage
    const marginPct = (selling !== null && selling > 0 && profitPiece !== null)
      ? Math.round((profitPiece / selling) * 100)
      : null;

    return {
      qty,
      fabric,
      thread,
      material,
      printing,
      labour,
      other,
      selling,
      total,
      perPiece,
      profitPiece,
      totalProf,
      marginPct,
      hasSelling,
    };
  }, [quantity, fabricCost, threadCost, materialCost, printingCost, labourCost, otherCost, sellingPrice]);

  // Load Saved Calculations
  const loadCalculations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cost-calculator');
      const data = await res.json();
      if (data.success && Array.isArray(data.calculations)) {
        setCalculations(data.calculations);
      } else {
        console.warn('Could not load calculations:', data.error);
      }
    } catch (err) {
      console.error('Error fetching calculations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadCalculations();
  }, []);

  // Form Reset
  const handleReset = () => {
    setProductName('');
    setQuantity('1');
    setFabricCost('');
    setThreadCost('');
    setMaterialCost('');
    setPrintingCost('');
    setLabourCost('');
    setOtherCost('');
    setSellingPrice('');
    setEditingId(null);
  };

  // New Calculation Button
  const handleNewCalculation = () => {
    handleReset();
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Populate Form for Editing
  const handleEdit = (calc: CostCalculationRecord) => {
    setEditingId(calc.id);
    setProductName(calc.productName || calc.product_name || '');
    setQuantity(String(calc.quantity || 1));
    setFabricCost(calc.fabricCost ? String(calc.fabricCost) : (calc.fabric_cost ? String(calc.fabric_cost) : ''));
    setThreadCost(calc.threadCost ? String(calc.threadCost) : (calc.thread_cost ? String(calc.thread_cost) : ''));
    setMaterialCost(calc.materialCost ? String(calc.materialCost) : (calc.material_cost ? String(calc.material_cost) : ''));
    setPrintingCost(calc.printingCost ? String(calc.printingCost) : (calc.printing_cost ? String(calc.printing_cost) : ''));
    setLabourCost(calc.labourCost ? String(calc.labourCost) : (calc.labour_cost ? String(calc.labour_cost) : ''));
    setOtherCost(calc.otherCost ? String(calc.otherCost) : (calc.other_cost ? String(calc.other_cost) : ''));

    const sell = calc.sellingPrice ?? calc.selling_price;
    setSellingPrice(sell !== null && sell !== undefined ? String(sell) : '');

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Save / Update Calculation
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      showNotification('error', 'Please enter a valid product name.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        productName: productName.trim(),
        quantity: liveCalculations.qty,
        fabricCost: liveCalculations.fabric,
        threadCost: liveCalculations.thread,
        materialCost: liveCalculations.material,
        printingCost: liveCalculations.printing,
        labourCost: liveCalculations.labour,
        otherCost: liveCalculations.other,
        sellingPrice: liveCalculations.selling,
      };

      const endpoint = editingId ? `/api/cost-calculator/${editingId}` : '/api/cost-calculator';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.calculation) {
        if (editingId) {
          setCalculations((prev) =>
            prev.map((item) => (item.id === editingId ? data.calculation : item))
          );
          showNotification('success', `Calculation for "${data.calculation.productName}" updated successfully.`);
          setEditingId(null);
        } else {
          setCalculations((prev) => [data.calculation, ...prev]);
          showNotification('success', `Calculation for "${data.calculation.productName}" saved successfully.`);
          handleReset();
        }
      } else {
        throw new Error(data.error || 'Failed to save calculation');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      showNotification('error', err.message || 'Error saving calculation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Confirm and Execute Deletion
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cost-calculator/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        setCalculations((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        showNotification(
          'success',
          `Calculation for "${deleteTarget.productName || deleteTarget.product_name}" removed.`
        );
        if (editingId === deleteTarget.id) {
          handleReset();
        }
        setDeleteTarget(null);
      } else {
        throw new Error(data.error || 'Failed to delete calculation');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      showNotification('error', err.message || 'Error deleting calculation.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered History
  const filteredCalculations = useMemo(() => {
    if (!searchQuery.trim()) return calculations;
    const q = searchQuery.toLowerCase();
    return calculations.filter((c) => {
      const name = (c.productName || c.product_name || '').toLowerCase();
      return name.includes(q);
    });
  }, [calculations, searchQuery]);

  // Aggregate Stats
  const aggregateStats = useMemo(() => {
    const count = calculations.length;
    if (count === 0) return { count: 0, totalBatchSum: 0, totalProfitSum: 0 };
    const totalBatchSum = calculations.reduce((acc, curr) => acc + (curr.totalCost || curr.total_cost || 0), 0);
    const totalProfitSum = calculations.reduce((acc, curr) => acc + (curr.totalProfit || curr.total_profit || 0), 0);
    return { count, totalBatchSum, totalProfitSum };
  }, [calculations]);

  if (!mounted) return null;

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
        {/* Toast / Notification Banner */}
        {notification && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-xs sm:text-sm font-poppins transition-all duration-300 border ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#FF6A00]/10 text-[#FF6A00] rounded-lg">
                <Calculator size={18} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00] font-inter">
                Production & Costing
              </span>
            </div>
            <h1 className="font-marcellus text-2xl sm:text-3xl font-light text-[#1A1A1A]">
              Cost Calculator
            </h1>
            <p className="text-xs text-gray-500 font-poppins">
              Calculate garment production costs, unit economics, price points, and profit margins in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleNewCalculation}
              className="bg-[#1A1A1A] hover:bg-[#FF6A00] text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus size={14} /> New Calculation
            </button>
            <button
              type="button"
              onClick={loadCalculations}
              disabled={loading}
              title="Refresh History"
              className="p-2.5 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Quick KPI Overview Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF6A00] shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-inter block">
                Saved Calculations
              </span>
              <span className="text-lg font-semibold text-gray-900 font-poppins">
                {aggregateStats.count} {aggregateStats.count === 1 ? 'Garment' : 'Garments'}
              </span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Package size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-inter block">
                Total Production Tracked
              </span>
              <span className="text-lg font-semibold text-gray-900 font-poppins">
                {formatINR(aggregateStats.totalBatchSum)}
              </span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-inter block">
                Total Tracked Profit
              </span>
              <span className="text-lg font-semibold text-emerald-700 font-poppins">
                {formatINR(aggregateStats.totalProfitSum)}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN CALCULATOR INTERFACE (2-Column Grid) */}
        <div ref={formRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Cost Input Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-[28px] p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-wider font-inter block">
                  {editingId ? 'Editing Record' : 'Production Parameters'}
                </span>
                <h2 className="font-marcellus text-xl text-gray-900 font-light">
                  {editingId ? 'Modify Cost Calculation' : 'Enter Garment Costs'}
                </h2>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 cursor-pointer font-poppins"
                >
                  <X size={14} /> Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Product Info Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1.5 font-inter">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Raw Silk Banarasi Saree"
                    className="w-full px-3.5 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm font-poppins focus:outline-none focus:border-[#FF6A00] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1.5 font-inter">
                    Quantity (Pieces) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="1"
                      className="w-full px-3.5 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm font-poppins focus:outline-none focus:border-[#FF6A00] focus:bg-white transition-colors text-right pr-9"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-poppins pointer-events-none">
                      pcs
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Inputs Section Header */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-px bg-gray-100 flex-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-inter">
                    Direct Production Cost Items (₹ INR)
                  </span>
                  <span className="h-px bg-gray-100 flex-1" />
                </div>

                {/* Direct Costs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fabric Cost */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1.5 font-inter">
                      Fabric Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium font-poppins">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={fabricCost}
                        onChange={(e) => setFabricCost(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3.5 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm font-poppins focus:outline-none focus:border-[#FF6A00] focus:bg-white transition-colors"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-poppins mt-1 block">
                      Main fabric, silk, linen, organza
                    </span>
                  </div>

                  {/* Thread Cost */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1.5 font-inter">
                      Thread Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium font-poppins">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={threadCost}
                        onChange={(e) => setThreadCost(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3.5 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm font-poppins focus:outline-none focus:border-[#FF6A00] focus:bg-white transition-colors"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-poppins mt-1 block">
                      Sewing, embroidery, zari thread
                    </span>
                  </div>

                  {/* Material Cost */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1.5 font-inter">
                      Material Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium font-poppins">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={materialCost}
                        onChange={(e) => setMaterialCost(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3.5 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm font-poppins focus:outline-none focus:border-[#FF6A00] focus:bg-white transition-colors"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-poppins mt-1 block">
                      Borders, laces, buttons, lining
                    </span>
                  </div>

                  {/* Printing Cost */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1.5 font-inter">
                      Printing Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium font-poppins">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={printingCost}
                        onChange={(e) => setPrintingCost(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3.5 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm font-poppins focus:outline-none focus:border-[#FF6A00] focus:bg-white transition-colors"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-poppins mt-1 block">
                      Block printing, digital, screen, dyeing
                    </span>
                  </div>

                  {/* Labour Cost */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1.5 font-inter">
                      Labour Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium font-poppins">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={labourCost}
                        onChange={(e) => setLabourCost(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3.5 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm font-poppins focus:outline-none focus:border-[#FF6A00] focus:bg-white transition-colors"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-poppins mt-1 block">
                      Cutting, master tailoring, handwork
                    </span>
                  </div>

                  {/* Other Cost */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block mb-1.5 font-inter">
                      Other Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium font-poppins">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={otherCost}
                        onChange={(e) => setOtherCost(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3.5 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs sm:text-sm font-poppins focus:outline-none focus:border-[#FF6A00] focus:bg-white transition-colors"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-poppins mt-1 block">
                      Packaging, garment tags, overheads
                    </span>
                  </div>
                </div>
              </div>

              {/* Commercial Pricing Section */}
              <div className="pt-2 bg-amber-50/30 border border-amber-200/50 rounded-2xl p-4.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-700 tracking-wider block font-inter">
                      Selling Price Per Piece <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-gray-500 font-poppins">
                      Provide planned retail price to automatically compute unit and batch profit.
                    </span>
                  </div>
                </div>
                <div className="relative max-w-xs mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium font-poppins">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="e.g. 8500.00"
                    className="w-full pl-7 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-poppins focus:outline-none focus:border-[#FF6A00] transition-colors"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#1A1A1A] hover:bg-[#FF6A00] text-white py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <Save size={14} /> Update Calculation
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Save Calculation
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-3.5 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-gray-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Live Result Section & Summary Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-sm border border-gray-100 space-y-6 sticky top-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-wider font-inter block">
                    Real-time Analysis
                  </span>
                  <h3 className="font-marcellus text-xl text-gray-900 font-light">
                    Calculation Summary
                  </h3>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-poppins font-medium">
                  {liveCalculations.qty} {liveCalculations.qty === 1 ? 'Piece' : 'Pieces'}
                </span>
              </div>

              {/* Highlight 1: Total Production Cost */}
              <div className="bg-linear-to-br from-amber-50 to-orange-50 border border-orange-200/80 rounded-2xl p-5 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-medium text-orange-900 font-inter">
                  <span className="uppercase tracking-wider text-[10px] font-bold">
                    Total Production Cost
                  </span>
                  <span className="bg-orange-100/80 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#FF6A00]">
                    Batch Total
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-semibold text-gray-950 font-poppins tracking-tight">
                  {formatINR(liveCalculations.total, true)}
                </div>
                <div className="text-xs text-orange-950/70 font-poppins flex items-center justify-between pt-1 border-t border-orange-200/40">
                  <span>Manufacturing Cost Per Piece:</span>
                  <span className="font-semibold text-gray-900">
                    {formatINR(liveCalculations.perPiece, true)}
                  </span>
                </div>
              </div>

              {/* Highlight 2: Total Profit */}
              <div
                className={`border rounded-2xl p-5 space-y-2 transition-all ${
                  !liveCalculations.hasSelling
                    ? 'bg-gray-50 border-gray-200/80'
                    : liveCalculations.profitPiece !== null && liveCalculations.profitPiece >= 0
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-rose-50/70 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium font-inter">
                  <span
                    className={`uppercase tracking-wider text-[10px] font-bold ${
                      !liveCalculations.hasSelling
                        ? 'text-gray-500'
                        : liveCalculations.profitPiece !== null && liveCalculations.profitPiece >= 0
                        ? 'text-emerald-800'
                        : 'text-rose-800'
                    }`}
                  >
                    Total Estimated Profit
                  </span>
                  {liveCalculations.hasSelling && liveCalculations.marginPct !== null && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                        liveCalculations.profitPiece !== null && liveCalculations.profitPiece >= 0
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {liveCalculations.profitPiece !== null && liveCalculations.profitPiece >= 0 ? (
                        <TrendingUp size={10} />
                      ) : (
                        <TrendingDown size={10} />
                      )}
                      {liveCalculations.marginPct}% Margin
                    </span>
                  )}
                </div>
                <div
                  className={`text-3xl sm:text-4xl font-semibold font-poppins tracking-tight ${
                    !liveCalculations.hasSelling
                      ? 'text-gray-400'
                      : liveCalculations.profitPiece !== null && liveCalculations.profitPiece >= 0
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {liveCalculations.hasSelling
                    ? formatINR(liveCalculations.totalProf, true)
                    : '—'}
                </div>
                <div
                  className={`text-xs font-poppins flex items-center justify-between pt-1 border-t ${
                    !liveCalculations.hasSelling
                      ? 'border-gray-200 text-gray-400'
                      : liveCalculations.profitPiece !== null && liveCalculations.profitPiece >= 0
                      ? 'border-emerald-200/40 text-emerald-900/70'
                      : 'border-rose-200/40 text-rose-900/70'
                  }`}
                >
                  <span>Profit Per Piece:</span>
                  <span className="font-semibold text-gray-900">
                    {liveCalculations.hasSelling
                      ? formatINR(liveCalculations.profitPiece, true)
                      : 'Enter Selling Price'}
                  </span>
                </div>
              </div>

              {/* 3 Unit Economics Key Metrics */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                  <span className="text-[9px] uppercase font-bold text-gray-500 block font-inter mb-1">
                    Cost / Piece
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 font-poppins">
                    {formatINR(liveCalculations.perPiece)}
                  </span>
                </div>

                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                  <span className="text-[9px] uppercase font-bold text-gray-500 block font-inter mb-1">
                    Selling / Piece
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 font-poppins">
                    {liveCalculations.hasSelling
                      ? formatINR(liveCalculations.selling)
                      : '—'}
                  </span>
                </div>

                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                  <span className="text-[9px] uppercase font-bold text-gray-500 block font-inter mb-1">
                    Profit / Piece
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-semibold font-poppins ${
                      !liveCalculations.hasSelling
                        ? 'text-gray-400'
                        : liveCalculations.profitPiece !== null && liveCalculations.profitPiece >= 0
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {liveCalculations.hasSelling
                      ? formatINR(liveCalculations.profitPiece)
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Visual Breakdown Progress Bar */}
              <div className="pt-2 border-t border-gray-100">
                <CostBreakdownBar
                  fabricCost={liveCalculations.fabric}
                  threadCost={liveCalculations.thread}
                  materialCost={liveCalculations.material}
                  printingCost={liveCalculations.printing}
                  labourCost={liveCalculations.labour}
                  otherCost={liveCalculations.other}
                  totalCost={liveCalculations.total}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RECENT CALCULATIONS / HISTORY TABLE SECTION */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-wider font-inter block">
                Historical Database
              </span>
              <h2 className="font-marcellus text-xl sm:text-2xl text-gray-900 font-light">
                Recent Calculations
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name..."
                className="w-full pl-9 pr-3.5 py-2 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#FF6A00] focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2 font-poppins text-xs">
                <Loader2 size={24} className="animate-spin text-[#FF6A00]" />
                <span>Loading calculation history...</span>
              </div>
            ) : filteredCalculations.length === 0 ? (
              <div className="py-12 text-center text-gray-400 font-poppins text-xs space-y-2">
                <Calculator size={32} className="mx-auto text-gray-300" />
                <p className="font-medium text-gray-600">No calculations found.</p>
                <p className="text-gray-400 text-[11px]">
                  {searchQuery
                    ? `No matching items found for "${searchQuery}"`
                    : 'Create your first garment cost calculation above!'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-poppins border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-inter">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-right">Total Cost</th>
                    <th className="py-3 px-4 text-right">Cost/Piece</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-right">Profit</th>
                    <th className="py-3 px-4 text-center">Date</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-transparent">
                  {filteredCalculations.map((calc) => {
                    const name = calc.productName || calc.product_name || 'Untitled';
                    const qty = calc.quantity || 1;
                    const totCost = calc.totalCost ?? calc.total_cost ?? 0;
                    const perPc = calc.costPerPiece ?? calc.cost_per_piece ?? 0;
                    const sp = calc.sellingPrice ?? calc.selling_price;
                    const prof = calc.totalProfit ?? calc.total_profit;
                    const hasSp = sp !== null && sp !== undefined && sp >= 0;
                    const isProfit = hasSp && prof !== null && prof !== undefined && prof >= 0;

                    const rawDate = calc.createdAt || calc.created_at;
                    const dateStr = rawDate
                      ? new Date(rawDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—';

                    return (
                      <tr
                        key={calc.id}
                        className="bg-gray-50/50 hover:bg-orange-50/20 border border-gray-100 rounded-xl transition-all"
                      >
                        {/* Product */}
                        <td className="py-3 px-4 font-medium text-gray-900 rounded-l-xl">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#FF6A00]" />
                            <span className="truncate max-w-[180px] sm:max-w-[240px] font-medium" title={name}>
                              {name}
                            </span>
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="py-3 px-4 text-center">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-[11px] font-medium">
                            {qty} pcs
                          </span>
                        </td>

                        {/* Total Cost */}
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          {formatINR(totCost)}
                        </td>

                        {/* Cost / Piece */}
                        <td className="py-3 px-4 text-right text-gray-600 font-medium">
                          {formatINR(perPc)}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4 text-right text-gray-600">
                          {hasSp ? formatINR(sp) : <span className="text-gray-300">—</span>}
                        </td>

                        {/* Profit */}
                        <td className="py-3 px-4 text-right">
                          {hasSp ? (
                            <span
                              className={`inline-flex items-center gap-1 font-semibold ${
                                isProfit ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {isProfit ? '+' : ''}
                              {formatINR(prof)}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-center text-gray-400 text-[11px]">
                          {dateStr}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 rounded-r-xl">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedCalculation(calc)}
                              title="View Breakdown Details"
                              className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-white rounded-lg transition-colors cursor-pointer shadow-xs border border-transparent hover:border-gray-200"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(calc)}
                              title="Edit Calculation"
                              className="p-1.5 text-gray-400 hover:text-[#FF6A00] hover:bg-white rounded-lg transition-colors cursor-pointer shadow-xs border border-transparent hover:border-gray-200"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(calc)}
                              title="Delete Calculation"
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer shadow-xs border border-transparent hover:border-gray-200"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* View Calculation Details Modal */}
      {selectedCalculation && (
        <CalculationDetailModal
          calculation={selectedCalculation}
          onClose={() => setSelectedCalculation(null)}
          onEdit={(calc) => {
            setSelectedCalculation(null);
            handleEdit(calc);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          calculation={deleteTarget}
          isOpen={!!deleteTarget}
          isDeleting={isDeleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </AdminLayout>
  );
}
