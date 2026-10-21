'use client';

import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  calculation: any | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  calculation,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen || !calculation) return null;

  const productName = calculation.productName || calculation.product_name || 'Calculation';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl space-y-5 relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="font-marcellus text-xl text-gray-900 font-light">
            Delete Cost Calculation?
          </h3>
          <p className="text-xs text-gray-500 font-poppins leading-relaxed">
            Are you sure you want to delete the calculation for{' '}
            <span className="font-semibold text-gray-800">“{productName}”</span>?
            This will permanently remove it from your saved calculation history.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 size={13} /> Confirm Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
