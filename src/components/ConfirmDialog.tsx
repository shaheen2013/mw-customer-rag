'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Info, Loader2, X } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  /** Highlighted item name (e.g. the file being deleted). */
  subject?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" for destructive actions, "info" otherwise. */
  variant?: 'danger' | 'info';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  subject,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const danger = variant === 'danger';
  const Icon = danger ? AlertTriangle : Info;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !loading && onCancel()}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="bg-[#0d1527] border border-[#1b2a47] rounded-lg max-w-md w-full p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${
              danger
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-400'
                : 'bg-blue-950/40 border-blue-800/60 text-blue-400'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 pr-4">
            <h3 id="confirm-dialog-title" className="text-base font-semibold text-white">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{description}</p>
            )}
            {subject && (
              <div
                className="mt-3 bg-[#121e36] border border-[#1b2a47] rounded px-3 py-2 text-xs font-mono text-slate-200 truncate"
                title={subject}
              >
                {subject}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#1b2a47] flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary text-xs px-4 py-1.5 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            autoFocus
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-medium transition disabled:opacity-70 ${
              danger
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
