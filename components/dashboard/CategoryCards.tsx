'use client';

import React from 'react';
import { Layers, Plus, Minus, Check, AlertCircle, Sparkles } from 'lucide-react';
import { CategoryId } from '@/types';
import { useSalesTracker } from '@/context/SalesTrackerContext';

interface CategoryCardsProps {
  onQuickAdd?: (category: CategoryId) => void;
}

export function CategoryCards({ onQuickAdd }: CategoryCardsProps) {
  const { stats, settings, products, quickAddSale, quickSubtractSale } = useSalesTracker();

  const categories: CategoryId[] = ['HIGH', 'MID', 'ENTRY'];

  const categoryStyles: Record<CategoryId, {
    bgLight: string;
    border: string;
    accent: string;
    barColor: string;
    badge: string;
  }> = {
    HIGH: {
      bgLight: 'bg-blue-50/50',
      border: 'border-blue-200/80',
      accent: 'text-blue-600',
      barColor: 'bg-blue-600',
      badge: 'bg-blue-100 text-blue-800',
    },
    MID: {
      bgLight: 'bg-emerald-50/50',
      border: 'border-emerald-200/80',
      accent: 'text-emerald-600',
      barColor: 'bg-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    ENTRY: {
      bgLight: 'bg-purple-50/50',
      border: 'border-purple-200/80',
      accent: 'text-purple-600',
      barColor: 'bg-purple-600',
      badge: 'bg-purple-100 text-purple-800',
    },
  };

  const handleQuickAdd = async (cat: CategoryId) => {
    if (onQuickAdd) {
      onQuickAdd(cat);
    } else {
      await quickAddSale(cat);
    }
  };

  const handleQuickSubtract = async (cat: CategoryId) => {
    await quickSubtractSale(cat);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Rendimiento e Incentivos por Gama</span>
          </h2>
          <p className="text-xs text-slate-600">
            Seguimiento de consecución mínima (80%) y tramos de liquidación hasta el 140%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((catId) => {
          const catStat = stats.categoriesStats[catId];
          const catConfig = settings.categories[catId];
          const style = categoryStyles[catId];

          // Productos asociados a esta gama
          const categoryProducts = products.filter(
            (p) => p.category === catId && p.isActive !== false
          );

          const isGoalReached = catStat.progressPercentage >= 100;
          const isEligible = catStat.isEligible; // >= 80%

          return (
            <div
              key={catId}
              id={`category-card-${catId.toLowerCase()}`}
              className={`bg-white rounded-2xl p-5 border ${style.border} shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow`}
            >
              <div>
                {/* Cabecera de la Gama */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider ${style.badge}`}>
                      {catId}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {catConfig?.name || catId}
                    </span>
                  </div>

                  {/* Botones rápidos "-1" y "+1" para móvil/escritorio */}
                  <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/70">
                    <button
                      onClick={() => handleQuickSubtract(catId)}
                      id={`quick-subtract-${catId.toLowerCase()}-btn`}
                      className="flex items-center justify-center w-7 h-7 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded-md text-xs font-bold transition-all active:scale-95"
                      title={`Restar 1 venta a ${catId}`}
                      aria-label={`Restar venta rápida a gama ${catId}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-3.5 bg-slate-300" />
                    <button
                      onClick={() => handleQuickAdd(catId)}
                      id={`quick-add-${catId.toLowerCase()}-btn`}
                      className="flex items-center justify-center w-7 h-7 hover:bg-blue-100 hover:text-blue-700 text-slate-700 rounded-md text-xs font-bold transition-all active:scale-95"
                      title={`Añadir 1 venta a ${catId}`}
                      aria-label={`Añadir venta rápida a gama ${catId}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Consecución: Ventas actuales / Objetivo */}
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {catStat.currentSales}
                    </span>
                    <span className="text-sm font-semibold text-slate-600">
                      / {catStat.target} uds
                    </span>
                  </div>

                  <span
                    className={`text-lg font-bold ${
                      isGoalReached
                        ? 'text-emerald-600'
                        : isEligible
                        ? 'text-blue-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {catStat.progressPercentage}%
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isGoalReached
                        ? 'bg-emerald-500'
                        : isEligible
                        ? style.barColor
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, catStat.progressPercentage)}%` }}
                  />
                </div>

                {/* Estado del Incentivo */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Incentivo Base:</span>
                    <span className="font-semibold text-slate-900">
                      {catStat.baseIncentive} €
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">% Pago liquidación:</span>
                    <span className="font-semibold text-slate-900">
                      {catStat.payoutPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="font-medium text-slate-700">Incentivo estimado:</span>
                    <span
                      className={`text-sm font-extrabold ${
                        catStat.estimatedIncentive > 0
                          ? 'text-emerald-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {catStat.estimatedIncentive.toFixed(2)} €
                    </span>
                  </div>
                </div>

                {/* Indicador de elegibilidad */}
                <div className="text-[11px] mb-3">
                  {isEligible ? (
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Umbral mínimo superado ({catStat.progressPercentage}% ≥ 80%)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-700">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Faltan {Math.max(0, Math.ceil(catStat.target * 0.8) - catStat.currentSales)} uds para cobrar incentivo (80%)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Productos incluidos */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-semibold uppercase text-slate-600 tracking-wider block mb-1.5">
                  Productos asignados ({categoryProducts.length}):
                </span>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                  {categoryProducts.length > 0 ? (
                    categoryProducts.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                      >
                        <span>{p.name}</span>
                        {p.bonus > 0 && (
                          <span className="text-emerald-600 font-bold">+{p.bonus}€</span>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-600 text-[10px]">Sin productos vinculados</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
