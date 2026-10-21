'use client';

import React from 'react';

interface CostBreakdownBarProps {
  fabricCost: number;
  threadCost: number;
  materialCost: number;
  printingCost: number;
  labourCost: number;
  otherCost: number;
  totalCost: number;
}

export function CostBreakdownBar({
  fabricCost,
  threadCost,
  materialCost,
  printingCost,
  labourCost,
  otherCost,
  totalCost,
}: CostBreakdownBarProps) {
  if (totalCost <= 0) {
    return (
      <div className="py-2 text-center text-xs text-gray-400 italic">
        Enter costs to view percentage breakdown
      </div>
    );
  }

  const items = [
    { label: 'Fabric', value: fabricCost, color: '#FF6A00' },
    { label: 'Thread', value: threadCost, color: '#3B82F6' },
    { label: 'Material', value: materialCost, color: '#8B5CF6' },
    { label: 'Printing', value: printingCost, color: '#EC4899' },
    { label: 'Labour', value: labourCost, color: '#10B981' },
    { label: 'Other', value: otherCost, color: '#6B7280' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-[11px] font-medium text-gray-500 font-inter">
        <span>Cost Distribution</span>
        <span>100% Total</span>
      </div>

      {/* Stacked Progress Bar */}
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
        {items.map((item) => {
          const percentage = ((item.value / totalCost) * 100).toFixed(1);
          return (
            <div
              key={item.label}
              style={{
                width: `${percentage}%`,
                backgroundColor: item.color,
              }}
              className="h-full transition-all duration-300 relative group cursor-pointer"
              title={`${item.label}: ₹${item.value.toLocaleString('en-IN')} (${percentage}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
        {items.map((item) => {
          const pct = Math.round((item.value / totalCost) * 100);
          return (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-600 font-poppins">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.label}</span>
              <span className="text-gray-400 font-semibold ml-auto">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
