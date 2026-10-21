'use client';

import React from 'react';
import { X, Edit2, Calendar, Package, Tag, Layers, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { CostBreakdownBar } from './CostBreakdownBar';

interface CalculationDetailModalProps {
  calculation: any | null;
  onClose: () => void;
  onEdit: (calc: any) => void;
}

export function CalculationDetailModal({
  calculation,
  onClose,
  onEdit,
}: CalculationDetailModalProps) {
  if (!calculation) return null;

  const productName = calculation.productName || calculation.product_name || 'Untitled Garment';
  const quantity = calculation.quantity || 1;
  const fabricCost = calculation.fabricCost ?? calculation.fabric_cost ?? 0;
  const threadCost = calculation.threadCost ?? calculation.thread_cost ?? 0;
  const materialCost = calculation.materialCost ?? calculation.material_cost ?? 0;
  const printingCost = calculation.printingCost ?? calculation.printing_cost ?? 0;
  const labourCost = calculation.labourCost ?? calculation.labour_cost ?? 0;
  const otherCost = calculation.otherCost ?? calculation.other_cost ?? 0;
  const totalCost = calculation.totalCost ?? calculation.total_cost ?? 0;
  const costPerPiece = calculation.costPerPiece ?? calculation.cost_per_piece ?? 0;
  const sellingPrice = calculation.sellingPrice ?? calculation.selling_price;
  const profitPerPiece = calculation.profitPerPiece ?? calculation.profit_per_piece;
  const totalProfit = calculation.totalProfit ?? calculation.total_profit;

  const hasSelling = sellingPrice !== null && sellingPrice !== undefined && sellingPrice >= 0;
  const isProfitable = hasSelling && (profitPerPiece || 0) >= 0;
  const marginPercent = (hasSelling && sellingPrice > 0 && profitPerPiece !== null)
    ? Math.round((profitPerPiece / sellingPrice) * 100)
    : null;

  const createdDate = calculation.createdAt || calculation.created_at
    ? new Date(calculation.createdAt || calculation.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const formatINR = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const costBreakdownList = [
    { label: 'Fabric Cost', value: fabricCost, color: '#FF6A00' },
    { label: 'Thread Cost', value: threadCost, color: '#3B82F6' },
    { label: 'Material Cost (Zari, Borders, Lining)', value: materialCost, color: '#8B5CF6' },
    { label: 'Printing & Dyeing Cost', value: printingCost, color: '#EC4899' },
    { label: 'Labour & Tailoring Cost', value: labourCost, color: '#10B981' },
    { label: 'Other / Packaging Cost', value: otherCost, color: '#6B7280' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[28px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00] font-inter">
              Calculation Breakdown
            </span>
            <h3 className="font-marcellus text-2xl text-gray-900 font-light">
              {productName}
            </h3>
            <div className="flex items-center gap-4 text-xs text-gray-500 font-poppins pt-1">
              <span className="flex items-center gap-1">
                <Package size={14} className="text-gray-400" />
                {quantity} {quantity === 1 ? 'piece' : 'pieces'} batch
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-gray-400" />
                {createdDate}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Primary KPI Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Cost Card */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4.5 space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-amber-800">
              <span className="font-inter uppercase tracking-wide text-[10px]">Total Production Cost</span>
              <span className="bg-amber-100 px-2 py-0.5 rounded-full text-[10px] font-semibold text-amber-900">
                Batch of {quantity}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
              {formatINR(totalCost)}
            </div>
            <div className="text-xs text-amber-900/70 font-poppins">
              Cost Per Piece: <span className="font-semibold">{formatINR(costPerPiece)}</span>
            </div>
          </div>

          {/* Profit Card */}
          <div className={`border rounded-2xl p-4.5 space-y-1 ${
            !hasSelling
              ? 'bg-gray-50 border-gray-200'
              : isProfitable
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-rose-50/70 border-rose-200'
          }`}>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className={`font-inter uppercase tracking-wide text-[10px] ${
                !hasSelling ? 'text-gray-600' : isProfitable ? 'text-emerald-800' : 'text-rose-800'
              }`}>
                Total Estimated Profit
              </span>
              {hasSelling && marginPercent !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                  isProfitable ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                }`}>
                  {isProfitable ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {marginPercent}% Margin
                </span>
              )}
            </div>
            <div className={`text-2xl sm:text-3xl font-semibold font-poppins ${
              !hasSelling ? 'text-gray-400' : isProfitable ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {hasSelling ? formatINR(totalProfit) : 'Not specified'}
            </div>
            <div className={`text-xs font-poppins ${
              !hasSelling ? 'text-gray-400' : isProfitable ? 'text-emerald-800/80' : 'text-rose-800/80'
            }`}>
              {hasSelling ? (
                <>
                  Profit Per Piece: <span className="font-semibold">{formatINR(profitPerPiece)}</span>
                </>
              ) : (
                'Add selling price to view profit'
              )}
            </div>
          </div>
        </div>

        {/* Unit Economics Breakdown Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-inter">
            Unit Economics (Per Piece)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-gray-50/80 rounded-xl">
              <span className="text-[10px] text-gray-500 block uppercase font-inter">Quantity</span>
              <span className="font-semibold text-gray-900 font-poppins text-sm">{quantity} pcs</span>
            </div>
            <div className="p-3 bg-gray-50/80 rounded-xl">
              <span className="text-[10px] text-gray-500 block uppercase font-inter">Cost / Piece</span>
              <span className="font-semibold text-gray-900 font-poppins text-sm">{formatINR(costPerPiece)}</span>
            </div>
            <div className="p-3 bg-gray-50/80 rounded-xl">
              <span className="text-[10px] text-gray-500 block uppercase font-inter">Selling Price</span>
              <span className="font-semibold text-gray-900 font-poppins text-sm">
                {hasSelling ? formatINR(sellingPrice) : '—'}
              </span>
            </div>
            <div className="p-3 bg-gray-50/80 rounded-xl">
              <span className="text-[10px] text-gray-500 block uppercase font-inter">Profit / Piece</span>
              <span className={`font-semibold font-poppins text-sm ${
                !hasSelling ? 'text-gray-400' : isProfitable ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {hasSelling ? formatINR(profitPerPiece) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <CostBreakdownBar
            fabricCost={fabricCost}
            threadCost={threadCost}
            materialCost={materialCost}
            printingCost={printingCost}
            labourCost={labourCost}
            otherCost={otherCost}
            totalCost={totalCost}
          />
        </div>

        {/* Detailed Line Item Table */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-xs font-poppins">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-inter text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-4 text-left">Cost Component</th>
                <th className="py-2.5 px-4 text-right">Cost (₹)</th>
                <th className="py-2.5 px-4 text-right">Per Piece (₹)</th>
                <th className="py-2.5 px-4 text-right">Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {costBreakdownList.map((item) => {
                const perPieceItem = quantity > 0 ? item.value / quantity : 0;
                const sharePercent = totalCost > 0 ? ((item.value / totalCost) * 100).toFixed(1) : '0';
                return (
                  <tr key={item.label} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2 px-4 flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </td>
                    <td className="py-2 px-4 text-right font-medium text-gray-900">
                      {formatINR(item.value)}
                    </td>
                    <td className="py-2 px-4 text-right text-gray-500">
                      {formatINR(perPieceItem)}
                    </td>
                    <td className="py-2 px-4 text-right text-gray-400">
                      {sharePercent}%
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-semibold text-gray-900">
                <td className="py-3 px-4">Total Production Cost</td>
                <td className="py-3 px-4 text-right text-[#FF6A00] font-bold text-sm">
                  {formatINR(totalCost)}
                </td>
                <td className="py-3 px-4 text-right text-gray-900 font-bold">
                  {formatINR(costPerPiece)}
                </td>
                <td className="py-3 px-4 text-right text-gray-900">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-gray-50 transition-all cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(calculation);
            }}
            className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#e05e00] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Edit2 size={13} /> Edit Calculation
          </button>
        </div>
      </div>
    </div>
  );
}
