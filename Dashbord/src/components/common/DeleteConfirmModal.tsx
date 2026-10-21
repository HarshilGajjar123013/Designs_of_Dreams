'use client';

import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  itemDescription?: string;
  itemName?: string;
  count?: number;
  bulkCount?: number;
  itemType?: string;
  isDeleting?: boolean;
  isLoading?: boolean;
  isBulk?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  description,
  itemDescription,
  itemName,
  count,
  bulkCount,
  itemType = 'item',
  isDeleting,
  isLoading,
  isBulk,
  onClose,
  onConfirm,
  confirmText = 'Confirm Delete',
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const activeLoading = Boolean(isDeleting || isLoading);
  const effectiveCount = bulkCount !== undefined ? bulkCount : count;
  const isMultiple = Boolean(isBulk || (effectiveCount !== undefined && effectiveCount > 1));
  const displayTitle = title || (isMultiple ? `Delete ${effectiveCount || ''} ${itemType}s?` : `Delete ${itemType}?`);
  const effectiveDesc = itemDescription || description;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={activeLoading ? undefined : onClose}
          className="absolute inset-0 bg-black backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative bg-white rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-gray-100 z-10"
        >
          {/* Header row */}
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 shadow-xs">
              <AlertTriangle size={24} />
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={activeLoading}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Copy details */}
          <div className="space-y-2">
            <h3 className="font-marcellus text-xl text-gray-950 font-light tracking-wide">
              {displayTitle}
            </h3>
            <p className="text-xs text-gray-500 font-poppins leading-relaxed">
              {effectiveDesc ? (
                effectiveDesc.startsWith('Are you sure') ? (
                  effectiveDesc
                ) : (
                  <>
                    Are you sure you want to permanently delete{' '}
                    <span className="font-semibold text-gray-900">{effectiveDesc}</span>? This action cannot be undone.
                  </>
                )
              ) : isMultiple ? (
                <>
                  Are you sure you want to permanently delete{' '}
                  <span className="font-semibold text-gray-900">{effectiveCount} selected {itemType}s</span>? This action cannot be undone.
                </>
              ) : itemName ? (
                <>
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-gray-900">“{itemName}”</span>? This will permanently remove it from the system.
                </>
              ) : (
                'Are you sure you want to proceed with this deletion? This action cannot be undone.'
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={activeLoading}
              className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50 font-poppins"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={activeLoading}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-poppins"
            >
              {activeLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
