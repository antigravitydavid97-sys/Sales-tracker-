'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Shield,
  KeyRound,
  LogOut,
  PlusCircle,
  History,
  Settings,
  Calendar,
  CheckCircle2,
  Lock,
  Smartphone,
  Save,
  AlertCircle,
} from 'lucide-react';
import { useSalesTracker } from '@/context/SalesTrackerContext';
import { AdminLoginCard } from './AdminLoginCard';

export function AdminPanel() {
  const { isAdmin, adminUser, logoutAdmin, changeAdminPassword, stats } = useSalesTracker();

  // Estado para cambio de contraseña
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!currentPass) {
      setPasswordStatus({ type: 'error', message: 'Ingresa la contraseña actual' });
      return;
    }

    if (newPass.length < 3) {
      setPasswordStatus({ type: 'error', message: 'La nueva contraseña debe tener al menos 3 caracteres' });
      return;
    }

    if (newPass !== confirmPass) {
      setPasswordStatus({ type: 'error', message: 'Las contraseñas no coinciden' });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await changeAdminPassword(currentPass, newPass);
      if (res.success) {
        setPasswordStatus({ type: 'success', message: 'Contraseña cambiada exitosamente' });
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setPasswordStatus({ type: 'error', message: res.error || 'No se pudo cambiar la contraseña' });
      }
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div id="admin-panel-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isAdmin ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
          }`}>
            {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Panel de Administración</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isAdmin
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isAdmin ? 'Sesión Activa' : 'Modo Consulta (Bloqueado)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Control de acceso para modificar ventas, catálogo de modelos, objetivos y configuración del sistema.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={logoutAdmin}
            id="admin-panel-logout-btn"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {!isAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <AdminLoginCard
              title="Iniciar Sesión de Administrador"
              subtitle="Introduce tus credenciales para desbloquear el registro de ventas, corrección de errores y cambios en la configuración."
            />
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Privilegios protegidos por rol</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              En <strong>Modo Consulta</strong>, cualquier usuario puede examinar las métricas, ventas registradas, proyecciones e incentivos sin riesgo de alterar accidentalmente la información.
            </p>
            <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-start gap-2 text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Visualización libre:</strong> Dashboard, gráficas de ritmo, incentivos y estadísticas en tiempo real.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Requiere Login:</strong> Añadir ventas, restar unidades, modificar ventas existentes y borrar registros.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Requiere Login:</strong> Cambiar catálogo de modelos, bonus por unidad, objetivos de campaña y días festivos.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/ventas"
              id="admin-action-ventas"
              className="bg-white hover:border-blue-300 p-4 rounded-2xl border border-slate-200/80 shadow-xs transition-all hover:shadow-sm group flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Registrar Venta
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Añadir o restar unidades con bonus
                </p>
              </div>
            </Link>

            <Link
              href="/historial"
              id="admin-action-historial"
              className="bg-white hover:border-blue-300 p-4 rounded-2xl border border-slate-200/80 shadow-xs transition-all hover:shadow-sm group flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Gestionar Historial
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Editar o eliminar {stats.totalSales} ventas registradas
                </p>
              </div>
            </Link>

            <Link
              href="/configuracion"
              id="admin-action-config"
              className="bg-white hover:border-blue-300 p-4 rounded-2xl border border-slate-200/80 shadow-xs transition-all hover:shadow-sm group flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Modelos y Bonus
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configurar catálogo y recompensas
                </p>
              </div>
            </Link>

            <Link
              href="/"
              id="admin-action-calendar"
              className="bg-white hover:border-blue-300 p-4 rounded-2xl border border-slate-200/80 shadow-xs transition-all hover:shadow-sm group flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Calendario Laboral
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ajustar días de trabajo y festivos
                </p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Estado de Privilegios */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Privilegios de Administrador Habilitados</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Usuario: <strong className="text-slate-800">{adminUser}</strong>
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-800">Modificación y Resta de Ventas</p>
                      <p className="text-slate-500">Permite registrar ventas, restar unidades (-) y editar importes</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    Activo
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-800">Ajuste de Catálogo de Productos</p>
                      <p className="text-slate-500">Añadir modelos, modificar gamas y definir bonus unitario en €</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    Activo
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-800">Parámetros de Campaña y Objetivos</p>
                      <p className="text-slate-500">Modificar metas de unidades (HIGH/MID/ENTRY) y porcentajes de pago</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    Activo
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-800">Gestión de Copias y Restablecimiento</p>
                      <p className="text-slate-500">Importar backups JSON y limpiar datos de prueba</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    Activo
                  </span>
                </div>
              </div>
            </div>

            {/* Seguridad: Cambiar contraseña */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  <span>Seguridad de Acceso</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cambiar la contraseña o PIN de administrador
                </p>
              </div>

              {passwordStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  passwordStatus.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {passwordStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    id="admin-change-current-pass"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nueva contraseña o PIN
                  </label>
                  <input
                    type="password"
                    id="admin-change-new-pass"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Mínimo 3 caracteres"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    id="admin-change-confirm-pass"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  id="admin-change-pass-submit"
                  disabled={isChangingPass}
                  className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isChangingPass ? 'Guardando...' : 'Actualizar Contraseña'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
