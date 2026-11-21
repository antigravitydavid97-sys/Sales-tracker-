'use client';

import React, { useState, useEffect } from 'react';
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
  Wifi,
  WifiOff,
  RefreshCw,
  Sun,
  Moon,
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
    dismissToast,
    hasDemoData,
    clearDemoData,
    exportDataJSON,
    exportSalesCSV,
    isAdmin,
    adminUser,
    logoutAdmin,
    openLoginModal,
    showToast,
    theme,
    toggleTheme,
  } = useSalesTracker();

  const isDark = theme === 'dark';

  // Estado de conexión de red (Online / Offline)
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(true);
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [justReconnected, setJustReconnected] = useState<boolean>(false);

  useEffect(() => {
    const updateInitialStatus = () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsBrowserOnline(false);
      }
    };
    updateInitialStatus();

    const handleOnline = () => {
      setIsBrowserOnline(true);
      setSimulatedOffline(false);
      setJustReconnected(true);
      showToast('Conexión restablecida: Los datos se han sincronizado correctamente.', 'success');
      setTimeout(() => {
        setJustReconnected(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsBrowserOnline(false);
      setJustReconnected(false);
      showToast(
        'Modo Offline detectado: Tus ventas se guardarán localmente y los datos se sincronizarán al recuperar la red.',
        'info'
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  const isOnline = isBrowserOnline && !simulatedOffline;

  const handleToggleConnectionSimulation = () => {
    if (isOnline) {
      setSimulatedOffline(true);
      setJustReconnected(false);
      showToast(
        'Modo Offline activo: Los datos se guardan localmente y se sincronizarán al recuperar la red.',
        'info'
      );
    } else {
      setSimulatedOffline(false);
      setIsBrowserOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
      setJustReconnected(true);
      showToast('Conexión recuperada: Datos sincronizados con éxito.', 'success');
      setTimeout(() => {
        setJustReconnected(false);
      }, 4000);
    }
  };

  const currentMonthName = MONTH_NAMES[(settings.month || 1) - 1] || 'Mes actual';

  return (
    <div
      id="app-shell-container"
      data-theme={theme}
      className={`min-h-screen flex flex-col md:flex-row antialiased transition-colors duration-200 ${
        isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Sidebar para Escritorio (Desktop) */}
      <aside
        id="desktop-sidebar"
        className={`hidden md:flex flex-col w-64 border-r shrink-0 sticky top-0 h-screen overflow-y-auto transition-colors duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        {/* Brand Header */}
        <div className={`p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold tracking-tight shadow-sm shadow-blue-500/20">
              T
            </div>
            <div>
              <h1 className={`font-bold tracking-tight text-base leading-none ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                TE@M <span className="text-blue-500">Sales</span>
              </h1>
              <p className={`text-[11px] font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Tracker Profesional
              </p>
            </div>
          </div>

          {/* Contexto de campaña */}
          <div
            className={`mt-4 p-3 rounded-xl border text-xs space-y-1.5 ${
              isDark
                ? 'bg-slate-800/70 border-slate-700/80 text-slate-300'
                : 'bg-slate-50 border-slate-100 text-slate-600'
            }`}
          >
            <div className={`flex items-center gap-1.5 font-medium truncate ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              <Store className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{settings.storeName || 'Tienda'}</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <Calendar className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
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
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-white'
                      : isAdminItem && isAdmin
                      ? 'text-emerald-500'
                      : isDark
                      ? 'text-slate-400'
                      : 'text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
                {item.href === '/ventas' && (
                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : isDark
                      ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    + Venta
                  </span>
                )}
                {item.href === '/historial' && stats.totalSales > 0 && (
                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : isDark
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {stats.totalSales}
                  </span>
                )}
                {isAdminItem && (
                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : isAdmin
                      ? isDark
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : 'bg-emerald-100 text-emerald-700'
                      : isDark
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
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
        <div className={`px-4 py-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`p-2.5 rounded-xl border text-xs ${
            isAdmin
              ? isDark
                ? 'bg-emerald-950/40 border-emerald-800/70 text-emerald-200'
                : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
              : isDark
              ? 'bg-slate-800/70 border-slate-700 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
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
                  className="text-[10px] font-semibold text-rose-500 hover:text-rose-400 hover:underline cursor-pointer"
                  title="Cerrar sesión de administrador"
                >
                  Salir
                </button>
              ) : (
                <button
                  onClick={() => openLoginModal()}
                  id="sidebar-admin-login-prompt"
                  className="text-[10px] font-semibold text-blue-500 hover:text-blue-400 hover:underline cursor-pointer"
                >
                  Entrar
                </button>
              )}
            </div>
            <p className={`text-[10px] mt-1 leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isAdmin ? 'Edición de ventas habilitada' : 'Solo lectura activa'}
            </p>
          </div>
        </div>

        {/* Quick Export Actions */}
        <div className={`p-4 border-t space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wider px-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Exportar
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportSalesCSV}
              id="sidebar-export-csv-btn"
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-200 bg-slate-800 hover:bg-slate-700'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
              title="Descargar ventas en CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>CSV</span>
            </button>
            <button
              onClick={exportDataJSON}
              id="sidebar-export-json-btn"
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-200 bg-slate-800 hover:bg-slate-700'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
              title="Descargar copia de seguridad en JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>Backup</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior (Top Bar visible en móvil y escritorio con Indicador de Estado de Conexión y Tema) */}
        <header
          id="app-top-bar"
          className={`border-b px-4 md:px-6 lg:px-8 py-2.5 sticky top-0 z-30 shadow-2xs transition-colors duration-200 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            {/* Identidad en móvil / Contexto de tienda en escritorio */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="md:hidden w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                T
              </div>
              <div className="min-w-0">
                <h1 className={`md:hidden font-bold text-sm tracking-tight leading-tight truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  TE@M Sales Tracker
                </h1>
                <div className={`flex items-center gap-2 text-[11px] md:text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {settings.storeName || 'Tienda'}
                  </span>
                  <span>•</span>
                  <span className="truncate">
                    {currentMonthName} {settings.year}
                  </span>
                </div>
              </div>
            </div>

            {/* Indicador de Estado de Conexión (Online / Offline), Tema y Acciones Rápidas */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Botón rápido de cambio de tema (Claro / Oscuro) */}
              <button
                type="button"
                id="topbar-theme-toggle-btn"
                onClick={toggleTheme}
                aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                title={isDark ? 'Modo Oscuro activo (Clic para Modo Claro)' : 'Modo Claro activo (Clic para Modo Oscuro)'}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80'
                }`}
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="hidden sm:inline">Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="hidden sm:inline">Oscuro</span>
                  </>
                )}
              </button>

              {/* Indicador de Estado de Conexión */}
              <button
                type="button"
                id="connection-status-indicator"
                onClick={handleToggleConnectionSimulation}
                role="status"
                aria-live="polite"
                title={
                  isOnline
                    ? 'Estado de red: Online (Conectado). Clic para simular modo Offline.'
                    : 'Estado de red: Offline (Sin conexión). Los datos se sincronizarán al recuperar la red.'
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  isOnline
                    ? isDark
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800 hover:bg-emerald-900/70'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80'
                    : isDark
                    ? 'bg-amber-950/70 text-amber-300 border-amber-800 hover:bg-amber-900/70'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100/80 shadow-2xs'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Offline</span>
                  </>
                )}
              </button>

              {/* Controles rápidos para móvil */}
              <div className="md:hidden flex items-center gap-1.5">
                {isAdmin ? (
                  <Link
                    href="/admin"
                    id="mobile-header-admin-active"
                    className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold"
                    title="Sesión de administrador activa"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => openLoginModal()}
                    id="mobile-header-admin-login"
                    className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors"
                    title="Iniciar sesión de administrador"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Login</span>
                  </button>
                )}

                <button
                  onClick={exportSalesCSV}
                  id="mobile-quick-export-csv"
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-label="Exportar CSV"
                  title="Exportar a CSV"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
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
            </div>
          </div>

          {/* Notificación en la barra superior cuando el usuario está en modo Offline */}
          {!isOnline && (
            <div
              id="offline-sync-notification"
              role="alert"
              aria-live="assertive"
              className={`max-w-7xl mx-auto mt-2 px-3 py-2 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-150 ${
                isDark
                  ? 'bg-amber-950/70 border-amber-800 text-amber-200'
                  : 'bg-amber-50 border-amber-200/90 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>Modo Offline activo:</strong> Estás trabajando sin conexión. Tus ventas y cambios se guardan localmente y <strong>los datos se sincronizarán al recuperar la red</strong>.
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 self-start sm:self-auto ${
                  isDark ? 'text-amber-300 bg-amber-900/60' : 'text-amber-800 bg-amber-100/80'
                }`}
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Pendiente de sincronizar</span>
              </span>
            </div>
          )}

          {/* Notificación breve al recuperar la red */}
          {isOnline && justReconnected && (
            <div
              id="online-reconnected-notification"
              role="status"
              aria-live="polite"
              className={`max-w-7xl mx-auto mt-2 px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
                isDark
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                <strong>Conexión restablecida:</strong> Red detectada y datos sincronizados correctamente.
              </span>
            </div>
          )}
        </header>

        {/* Demo Notice Bar (cuando hay datos de demostración) */}
        {hasDemoData && (
          <div
            id="demo-data-banner"
            className={`border-b px-4 py-2 text-xs flex items-center justify-between ${
              isDark
                ? 'bg-amber-950/50 border-amber-800/70 text-amber-200'
                : 'bg-amber-50 border-amber-200/80 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Modo Demo Activo:</strong> Se muestran datos de ejemplo para explorar la aplicación.
              </span>
            </div>
            <button
              onClick={clearDemoData}
              id="clear-demo-data-btn"
              className={`flex items-center gap-1 text-[11px] font-semibold underline ml-2 shrink-0 ${
                isDark ? 'text-amber-300 hover:text-amber-100' : 'text-amber-900 hover:text-amber-950'
              }`}
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
        className={`md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md border-t py-1.5 px-2 z-40 flex items-center justify-around shadow-lg ${
          isDark
            ? 'bg-slate-900/95 border-slate-800'
            : 'bg-white/95 border-slate-200'
        }`}
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
                <div
                  className={`w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 border-2 active:scale-95 transition-transform ${
                    isDark ? 'border-slate-900' : 'border-white'
                  }`}
                >
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-blue-500 mt-0.5">
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
                isActive
                  ? 'text-blue-500 font-semibold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-700'
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
      <Toast toast={toast} onClose={dismissToast} />
    </div>
  );
}

