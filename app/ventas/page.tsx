'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, ArrowLeft, History, Layers } from 'lucide-react';
import { RegisterSaleForm } from '@/components/sales/RegisterSaleForm';

export default function VentasPage() {
  const router = useRouter();

  return (
    <div id="ventas-page-container" className="space-y-6">
      {/* Cabecera de la Pantalla */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Volver al Dashboard"
            aria-label="Volver al Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span>Registrar Venta</span>
            </h1>
            <p className="text-xs text-slate-600">
              Añade unidades vendidas para actualizar incentivos, proyecciones y bonus
            </p>
          </div>
        </div>

        <Link
          href="/historial"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          <History className="w-4 h-4 text-slate-600" />
          <span className="hidden sm:inline">Ver Historial</span>
        </Link>
      </div>

      {/* Formulario */}
      <RegisterSaleForm />
    </div>
  );
}
