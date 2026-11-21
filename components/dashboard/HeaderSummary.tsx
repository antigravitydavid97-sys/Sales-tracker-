'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Download,
  FileSpreadsheet,
  Plus,
  Store,
  MapPin,
  Calendar,
  Zap,
  Check,
} from 'lucide-react';
import { CategoryId } from '@/types';
import { useSalesTracker } from '@/context/SalesTrackerContext';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function HeaderSummary() {
  const { settings, stats, exportDataJSON, exportSalesCSV, quickAddSale, theme } = useSalesTracker();
  const [recentCat, setRecentCat] = useState<CategoryId | null>(null);
  const currentMonthName = MONTH_NAMES[(settings.month || 1) - 1] || 'Mes actual';
  const isDark = theme === 'dark';

  const handleQuickAdd = async (category: CategoryId) => {
    await quickAddSale(category);
    setRecentCat(category);
    setTimeout(() => {
      setRecentCat((prev) => (prev === category ? null : prev));
    }, 900);
  };

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 border shadow-xs mb-6 transition-colors ${
        isDark
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200/80 text-slate-900'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Título y detalles de la tienda */}
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 font-semibold text-xs tracking-wide">
              {settings.campaignName || 'Campaña Oficial'}
            </span>
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Código: {settings.storeCode || 'N/A'}
            </span>
          </div>

          <h1 className={`text-2xl md:text-3xl font-bold mt-1 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            TE@M Sales Tracker
          </h1>

          <div className={`flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs md:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              <Store className="w-4 h-4 text-blue-600" />
              {settings.storeName || 'Tienda Principal'}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
              {settings.zone || 'Territorio Central'}
            </span>
            <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
              {currentMonthName} {settings.year}
            </span>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportSalesCSV}
            id="header-export-csv-btn"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium rounded-xl transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-200 bg-slate-800 hover:bg-slate-700'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
            title="Exportar ventas a archivo CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV</span>
          </button>

          <button
            onClick={exportDataJSON}
            id="header-export-json-btn"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium rounded-xl transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-200 bg-slate-800 hover:bg-slate-700'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
            title="Exportar copia de seguridad en JSON"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Backup</span>
          </button>

          <Link
            href="/configuracion"
            id="header-settings-link"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium rounded-xl transition-colors ${
              isDark
                ? 'text-slate-200 bg-slate-800 hover:bg-slate-700'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
            title="Configuración de campaña y objetivos"
          >
            <Settings className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
            <span className="hidden sm:inline">Configuración</span>
          </Link>

          <Link
            href="/ventas"
            id="header-register-sale-btn"
            className="flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Venta</span>
          </Link>
        </div>
      </div>

      {/* Barra de Acción Rápida (+HIGH, +MID, +ENTRY) para sumar +1 unidad por gama */}
      <div
        id="dashboard-quick-action-bar"
        className={`mt-4 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Registro Rápido (+1 ud)
            </span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Incrementa al instante 1 unidad vendida hoy en cada categoría
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-2.5">
          {/* +HIGH */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickAdd('HIGH')}
              id="dashboard-quick-btn-high"
              title="Incrementar +1 unidad en gama HIGH"
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-xs shadow-blue-600/25 transition-all active:scale-95 cursor-pointer"
            >
              {recentCat === 'HIGH' ? <Check className="w-3.5 h-3.5" /> : null}
              <span>+HIGH</span>
            </button>
            <span
              id="dashboard-quick-count-high"
              className={`hidden md:inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold border ${
                isDark
                  ? 'bg-blue-950/50 border-blue-800/70 text-blue-300'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              {stats.categoriesStats.HIGH.currentSales} uds
            </span>
          </div>

          {/* +MID */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickAdd('MID')}
              id="dashboard-quick-btn-mid"
              title="Incrementar +1 unidad en gama MID"
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-xs shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
            >
              {recentCat === 'MID' ? <Check className="w-3.5 h-3.5" /> : null}
              <span>+MID</span>
            </button>
            <span
              id="dashboard-quick-count-mid"
              className={`hidden md:inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold border ${
                isDark
                  ? 'bg-emerald-950/50 border-emerald-800/70 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {stats.categoriesStats.MID.currentSales} uds
            </span>
          </div>

          {/* +ENTRY */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickAdd('ENTRY')}
              id="dashboard-quick-btn-entry"
              title="Incrementar +1 unidad en gama ENTRY"
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-xs shadow-purple-600/25 transition-all active:scale-95 cursor-pointer"
            >
              {recentCat === 'ENTRY' ? <Check className="w-3.5 h-3.5" /> : null}
              <span>+ENTRY</span>
            </button>
            <span
              id="dashboard-quick-count-entry"
              className={`hidden md:inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold border ${
                isDark
                  ? 'bg-purple-950/50 border-purple-800/70 text-purple-300'
                  : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}
            >
              {stats.categoriesStats.ENTRY.currentSales} uds
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

