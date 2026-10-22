'use client';

import React from 'react';
import { X, Lock } from 'lucide-react';
import { useSalesTracker } from '@/context/SalesTrackerContext';
import { AdminLoginCard } from './AdminLoginCard';

export function AdminLoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginModalReason } = useSalesTracker();

  if (!isLoginModalOpen) return null;

  return (
    <div
      id="admin-login-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={closeLoginModal}
    >
      <div
        id="admin-login-modal-content"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>Autenticación Requerida</span>
          </div>
          <button
            onClick={closeLoginModal}
            id="close-admin-login-modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Cerrar ventana de login"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-2">
          <AdminLoginCard
            onSuccess={closeLoginModal}
            title="Permisos de Administrador"
            subtitle={loginModalReason || 'Inicia sesión como administrador para modificar ventas, catálogo y configuraciones.'}
            compact
          />
        </div>
      </div>
    </div>
  );
}
