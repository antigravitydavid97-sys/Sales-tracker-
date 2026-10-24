'use client';

import React from 'react';
import { ShoppingBag, Target, Percent, TrendingUp } from 'lucide-react';
import { useSalesTracker } from '@/context/SalesTrackerContext';

export function MetricCards() {
  const { stats } = useSalesTracker();

  const isAhead = stats.overallProgress >= 100;
  const isGoodPace = stats.rateStatus === 'sufficient' || isAhead;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {/* 1. Ventas Actuales */}
      <div
        id="metric-card-current-sales"
        className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-slate-600 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Ventas Actuales
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalSales}
            </span>
            <span className="text-xs md:text-sm font-semibold text-slate-600">
              / {stats.totalTarget} uds
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Faltan {Math.max(0, stats.totalTarget - stats.totalSales)} unidades
          </p>
        </div>
      </div>

      {/* 2. Objetivo Mensual */}
      <div
        id="metric-card-monthly-target"
        className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-slate-600 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Objetivo Mensual
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.totalTarget}
            <span className="text-xs md:text-sm font-normal text-slate-600 ml-1">uds</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Repartido en 3 gamas
          </p>
        </div>
      </div>

      {/* 3. Conseguido % */}
      <div
        id="metric-card-progress-percent"
        className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-slate-600 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Conseguido %
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            stats.overallProgress >= 120
              ? 'bg-amber-50 text-amber-600'
              : isAhead
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-blue-50 text-blue-600'
          }`}>
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-1">
            <span className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
              stats.overallProgress >= 120
                ? 'text-amber-600'
                : isAhead
                ? 'text-emerald-600'
                : stats.overallProgress >= 80
                ? 'text-blue-600'
                : 'text-slate-900'
            }`}>
              {stats.overallProgress}%
            </span>
            {stats.overallProgress >= 80 && (
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                  stats.overallProgress >= 120
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : stats.overallProgress >= 100
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                {stats.overallProgress >= 120
                  ? 'Hito 120%+'
                  : stats.overallProgress >= 100
                  ? 'Hito 100%'
                  : 'Hito 80%'}
              </span>
            )}
          </div>
          {/* Barra de progreso */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.overallProgress >= 120
                  ? 'bg-amber-500'
                  : isAhead
                  ? 'bg-emerald-500'
                  : stats.overallProgress >= 80
                  ? 'bg-blue-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, stats.overallProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Proyección de Cierre */}
      <div
        id="metric-card-closure-projection"
        className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-slate-600 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Proyección
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isGoodPace ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.projectedSales}
            </span>
            <span className="text-xs md:text-sm font-semibold text-slate-600">unidades</span>
          </div>
          <p className={`text-[11px] font-medium mt-1 ${
            stats.projectedSales >= stats.totalTarget ? 'text-emerald-600' : 'text-amber-600'
          }`}>
            {stats.projectedSales >= stats.totalTarget
              ? `+${stats.projectedSales - stats.totalTarget} sobre objetivo`
              : `${stats.totalTarget - stats.projectedSales} bajo objetivo`}
          </p>
        </div>
      </div>
    </div>
  );
}
