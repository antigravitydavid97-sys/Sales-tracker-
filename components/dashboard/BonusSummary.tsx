'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, Wallet, ArrowRight, Sparkles, Coins } from 'lucide-react';
import { useSalesTracker } from '@/context/SalesTrackerContext';

export function BonusSummary() {
  const { stats, products } = useSalesTracker();

  const productsWithBonus = products.filter((p) => p.bonus > 0 && p.isActive !== false);

  return (
    <div
      id="bonus-and-earnings-summary"
      className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Liquidación Estimada y Bonus de Producto
            </h2>
            <p className="text-xs text-slate-600">
              Suma de incentivos por objetivos de gama + bonus directos por ventas individuales
            </p>
          </div>
        </div>

        <Link
          href="/configuracion"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Gestionar bonus y catálogo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Total Incentivos de Gama */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Incentivo por Gamas
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {stats.totalIncentive.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-slate-600">€</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Calculado sobre tramos HIGH, MID y ENTRY
          </p>
        </div>

        {/* Bonus Acumulado */}
        <div
          id="bonus-accumulated-card"
          className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100"
        >
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Bonus Acumulado
            </span>
            <Gift className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-700">
              {stats.totalBonus.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-emerald-600">€</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">
            Garantizado por unidades de modelos en promoción
          </p>
        </div>

        {/* Total Ganancias Estimadas */}
        <div
          id="total-estimated-earnings-card"
          className="p-4 rounded-xl bg-blue-50/60 border border-blue-100"
        >
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Ganancia Estimada
            </span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl md:text-3xl font-extrabold text-blue-700">
              {stats.totalEstimatedEarnings.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-blue-600">€</span>
          </div>
          <p className="text-[11px] text-blue-700 mt-1">
            Incentivo global ({stats.totalIncentive.toFixed(2)}€) + Bonus ({stats.totalBonus.toFixed(2)}€)
          </p>
        </div>
      </div>

      {/* Chips de productos con bonus actual */}
      <div className="pt-2">
        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-2">
          Modelos con Bonus Activo en Campaña ({productsWithBonus.length}):
        </span>
        <div className="flex flex-wrap gap-2">
          {productsWithBonus.map((p) => (
            <div
              key={p.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
            >
              <span>{p.name}</span>
              <span className="text-[10px] text-slate-600">({p.category})</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                +{p.bonus}€
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
