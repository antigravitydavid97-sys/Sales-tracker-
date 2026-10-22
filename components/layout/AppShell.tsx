'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  Settings,
  Download,
  FileSpreadsheet,
  Trash2,
  Sparkles,
  Store,
  Calendar,
  Shield,
  ShieldCheck,
  Lock,
  LogOut,
} from 'lucide-react';
import { useSalesTracker } from '@/context/SalesTrackerContext';
import { Toast } from '@/components/ui/Toast';
import { AdminLoginModal } from '@/components/admin/AdminLoginModal';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ventas', label: 'Ventas', icon: PlusCircle },
  { href: '/historial', label: 'Historial', icon: History },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
  { href: '/admin', label: 'Admin', icon: Shield },
];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    settings,
    stats,
    toast,
    hasDemoData,
    clearDemoData,
    exportDataJSON,
    exportSalesCSV,
    isAdmin,
    adminUser,
    logoutAdmin,
    openLoginModal,
  } = useSalesTracker();

  const currentMonthName = MONTH_NAMES[(settings.month || 1) - 1] || 'Mes actual';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased">
      {/* Sidebar para Escritorio (Desktop) */}
      <aside
        id="desktop-sidebar"
        className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 sticky top-0 h-screen overflow-y-auto"
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold tracking-tight shadow-sm shadow-blue-500/20">
              T
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight text-base leading-none">
                TE@M <span className="text-blue-600">Sales</span>
              </h1>
              <p className="text-[11px] font-medium text-slate-600 mt-1">
                Tracker Profesional
              </p>
            </div>
          </div>

          {/* Contexto de campaña */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-slate-800 truncate">
              <Store className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{settings.storeName || 'Tienda'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>{currentMonthName} {settings.year}</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isAdminItem = item.href === '/admin';

            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-link-${item.label.toLowerCase()}`}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isAdminItem && isAdmin ? 'text-emerald-600' : 'text-slate-600'}`} />
                <span>{item.label}</span>
                {item.href === '/ventas' && (
                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-700'
                  }`}>
                    + Venta
                  </span>
                )}
                {item.href === '/historial' && stats.totalSales > 0 && (
                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {stats.totalSales}
                  </span>
                )}
                {isAdminItem && (
                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : isAdmin
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isAdmin ? 'Activo' : 'Login'}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin Session Status Box in Desktop Sidebar */}
        <div className="px-4 py-3 border-t border-slate-100">
          <div className={`p-2.5 rounded-xl border text-xs ${
            isAdmin
              ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className="font-semibold text-[11px] truncate">
                  {isAdmin ? adminUser : 'Modo Consulta'}
                </span>
              </div>
              {isAdmin ? (
                <button
                  onClick={logoutAdmin}
                  id="sidebar-admin-logout"
                  className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                  title="Cerrar sesión de administrador"
                >
                  Salir
                </button>
              ) : (
                <button
                  onClick={() => openLoginModal()}
                  id="sidebar-admin-login-prompt"
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Entrar
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-tight">
              {isAdmin ? 'Edición de ventas habilitada' : 'Solo lectura activa'}
            </p>
          </div>
        </div>

        {/* Quick Export Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider px-1">
            Exportar
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportSalesCSV}
              id="sidebar-export-csv-btn"
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Descargar ventas en CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>
            <button
              onClick={exportDataJSON}
              id="sidebar-export-json-btn"
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Descargar copia de seguridad en JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Backup</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header
          id="mobile-header"
          className="md:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              T
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm tracking-tight leading-tight">
                TE@M Sales Tracker
              </h1>
              <p className="text-[11px] text-slate-600 truncate max-w-[170px]">
                {settings.storeName || 'Tienda'} • {currentMonthName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mobile Admin Status Button */}
            {isAdmin ? (
              <Link
                href="/admin"
                id="mobile-header-admin-active"
                className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold"
                title="Sesión de administrador activa"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin</span>
              </Link>
            ) : (
              <button
                onClick={() => openLoginModal()}
                id="mobile-header-admin-login"
                className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors"
                title="Iniciar sesión de administrador"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Login</span>
              </button>
            )}

            <button
              onClick={exportSalesCSV}
              id="mobile-quick-export-csv"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Exportar CSV"
              title="Exportar a CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </button>
            <Link
              href="/ventas"
              id="mobile-header-quick-add"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Venta</span>
            </Link>
          </div>
        </header>

        {/* Demo Notice Bar (cuando hay datos de demostración) */}
        {hasDemoData && (
          <div
            id="demo-data-banner"
            className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Modo Demo Activo:</strong> Se muestran datos de ejemplo para explorar la aplicación.
              </span>
            </div>
            <button
              onClick={clearDemoData}
              id="clear-demo-data-btn"
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-900 hover:text-amber-950 underline ml-2 shrink-0"
            >
              <Trash2 className="w-3 h-3" />
              <span>Eliminar datos demo</span>
            </button>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Fácil de usar con una sola mano) */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 z-40 flex items-center justify-around shadow-lg"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isVentas = item.href === '/ventas';

          if (isVentas) {
            return (
              <Link
                key={item.href}
                href={item.href}
                id="mobile-tab-ventas"
                className="flex flex-col items-center justify-center -mt-5"
                aria-label="Registrar Venta"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 border-2 border-white active:scale-95 transition-transform">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-blue-600 mt-0.5">
                  Ventas
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`mobile-tab-${item.label.toLowerCase()}`}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-700'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin Login Modal (Triggerable from anywhere when unauthorized) */}
      <AdminLoginModal />

      {/* Persistent Toast Feedback */}
      <Toast toast={toast} />
    </div>
  );
}
