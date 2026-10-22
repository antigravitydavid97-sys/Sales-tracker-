'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  onClose?: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null;

  const bg =
    toast.type === 'error'
      ? 'bg-red-600 text-white shadow-red-200 dark:shadow-none'
      : toast.type === 'info'
      ? 'bg-blue-600 text-white shadow-blue-200 dark:shadow-none'
      : 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none';

  return (
    <div
      id="toast-notification"
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg font-medium text-sm border border-white/10 ${bg}`}
      >
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
        {toast.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
        
        <p className="flex-1 leading-snug">{toast.message}</p>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded-lg transition-colors"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
