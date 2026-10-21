'use client';

import React from 'react';
import { Trash2, CheckSquare, Square, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: () => void;
  itemName?: string;
  itemLabel?: string;
  isAllSelected?: boolean;
}

export default function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  itemName,
  itemLabel,
  isAllSelected,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  const displayLabel = itemLabel || itemName || 'items';
  const computedIsAllSelected = isAllSelected !== undefined 
    ? isAllSelected 
    : (totalCount > 0 && selectedCount === totalCount);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="sticky top-4 z-30 bg-gray-900/95 backdrop-blur-md text-white rounded-2xl px-5 py-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 border border-gray-800"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={computedIsAllSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-gray-200 hover:text-white transition-all cursor-pointer font-poppins"
          >
            {computedIsAllSelected ? (
              <CheckSquare size={16} className="text-[#FF6A00]" />
            ) : (
              <Square size={16} className="text-gray-400" />
            )}
            <span>{computedIsAllSelected ? 'Deselect All' : `Select All (${totalCount})`}</span>
          </button>

          <span className="h-4 w-px bg-gray-700" />

          <span className="text-xs font-medium text-gray-300 font-poppins">
            <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md mr-1.5 text-[11px] font-mono">
              {selectedCount}
            </span>
            {displayLabel} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDeleteSelected}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer font-poppins"
          >
            <Trash2 size={13} />
            <span>Delete Selected ({selectedCount})</span>
          </button>

          <button
            type="button"
            onClick={onDeselectAll}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all cursor-pointer"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X size={15} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
