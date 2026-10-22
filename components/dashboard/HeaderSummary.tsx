'use client';

import React from 'react';
import Link from 'next/link';
import {
  Settings,
  Download,
  FileSpreadsheet,
  Plus,
  Store,
  MapPin,
  Calendar,
  Tag,
} from 'lucide-react';
import { useSalesTracker } from '@/context/SalesTrackerContext';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function HeaderSummary() {
  const { settings, exportDataJSON, exportSalesCSV } = useSalesTracker();
  const currentMonthName = MONTH_NAMES[(settings.month || 1) - 1] || 'Mes actual';

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Título y detalles de la tienda */}
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 font-semibold text-xs tracking-wide">
              {settings.campaignName || 'Campaña Oficial'}
            </span>
            <span className="text-xs text-slate-600 font-medium">
              Código: {settings.storeCode || 'N/A'}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            TE@M Sales Tracker
          </h1>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs md:text-sm text-slate-600">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Store className="w-4 h-4 text-blue-600" />
              {settings.storeName || 'Tienda Principal'}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-600" />
              {settings.zone || 'Territorio Central'}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-800">
              <Calendar className="w-4 h-4 text-slate-600" />
              {currentMonthName} {settings.year}
            </span>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportSalesCSV}
            id="header-export-csv-btn"
            className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Exportar ventas a archivo CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV</span>
          </button>

          <button
            onClick={exportDataJSON}
            id="header-export-json-btn"
            className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Exportar copia de seguridad en JSON"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Backup</span>
          </button>

          <Link
            href="/configuracion"
            id="header-settings-link"
            className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Configuración de campaña y objetivos"
          >
            <Settings className="w-4 h-4 text-slate-600" />
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
    </div>
  );
}
