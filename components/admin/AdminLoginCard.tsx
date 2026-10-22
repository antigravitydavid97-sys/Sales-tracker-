'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, KeyRound, User, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { useSalesTracker } from '@/context/SalesTrackerContext';

interface AdminLoginCardProps {
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function AdminLoginCard({
  onSuccess,
  title = 'Acceso de Administrador',
  subtitle = 'Introduce la clave de administración para habilitar la edición de ventas, catálogo y configuración.',
  compact = false,
}: AdminLoginCardProps) {
  const { loginAdmin, isAdmin, adminUser, logoutAdmin } = useSalesTracker();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password.trim()) {
      setError('Por favor introduce la contraseña de administrador');
      return;
    }

    setSubmitting(true);
    try {
      const ok = await loginAdmin(password, username || 'Administrador');
      if (ok) {
        setPassword('');
        if (onSuccess) onSuccess();
      } else {
        setError('Contraseña incorrecta. Puedes usar la clave por defecto: admin123 o PIN: 1234');
      }
    } catch {
      setError('Error al procesar el inicio de sesión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setError(null);
  };

  if (isAdmin) {
    return (
      <div className={`bg-white rounded-2xl border border-emerald-200/80 p-5 md:p-6 shadow-xs ${compact ? '' : 'max-w-lg mx-auto'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">Sesión de Administrador Activa</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Conectado como <strong className="text-slate-800">{adminUser}</strong>. Tienes acceso completo de edición.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Todas las acciones de modificación están desbloqueadas.
          </span>
          <button
            onClick={logoutAdmin}
            id="admin-logout-btn"
            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 md:p-7 shadow-xs ${compact ? '' : 'max-w-md mx-auto'}`}>
      <div className="flex items-start gap-3.5 mb-5">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Usuario
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="admin-login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Contraseña o PIN de Administrador
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="admin-login-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••••••"
              autoFocus
              className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          id="admin-login-submit-btn"
          disabled={submitting}
          className="w-full py-2.5 px-5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{submitting ? 'Verificando...' : 'Iniciar Sesión'}</span>
        </button>
      </form>

      {/* Sugerencia rápida de credenciales predeterminadas para comodidad del usuario */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <span className="text-slate-500 font-medium">
          Clave inicial: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">admin123</code> (o <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono font-bold">1234</code>)
        </span>
        <button
          type="button"
          onClick={handleFillDemo}
          id="fill-demo-credentials-btn"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer underline text-[11px]"
        >
          <Sparkles className="w-3 h-3" />
          <span>Autocompletar</span>
        </button>
      </div>
    </div>
  );
}
