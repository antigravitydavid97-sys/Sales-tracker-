'use client';

import React from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CalendarCheck2,
  CalendarClock,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSalesTracker } from '@/context/SalesTrackerContext';

export function PaceControl() {
  const { stats, settings } = useSalesTracker();

  const isAchieved = stats.rateStatus === 'achieved';
  const isSufficient = stats.rateStatus === 'sufficient' || isAchieved;

  return (
    <div
      id="pace-control-section"
      className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Control del Ritmo de Ventas
            </h2>
            <p className="text-xs text-slate-600">
              Evaluación según días laborables transcurridos ({stats.workedDaysCount} de {stats.totalWorkingDays})
            </p>
          </div>
        </div>

        {/* Badge de Estado del Ritmo */}
        <div
          id="pace-status-badge"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold self-start sm:self-auto ${
            isAchieved
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : isSufficient
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {isAchieved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Objetivo global alcanzado</span>
            </>
          ) : isSufficient ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ritmo suficiente</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Necesitas aumentar el ritmo</span>
            </>
          )}
        </div>
      </div>

      {/* Grid de Métricas de Ritmo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        {/* Ritmo Actual */}
        <div
          id="stat-current-rate"
          className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Ritmo Actual
          </span>
          <div className="mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {stats.currentDailyRate.toString().replace('.', ',')}
              </span>
              <span className="text-xs font-medium text-slate-600">uds/día</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Sobre {stats.workedDaysCount} días trabajados
            </p>
          </div>
        </div>

        {/* Ritmo Necesario */}
        <div
          id="stat-required-rate"
          className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Ritmo Necesario
          </span>
          <div className="mt-1">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-extrabold tracking-tight ${
                isAchieved ? 'text-emerald-600' : 'text-slate-900'
              }`}>
                {isAchieved ? '0' : stats.requiredDailyRate.toString().replace('.', ',')}
              </span>
              <span className="text-xs font-medium text-slate-600">uds/día</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              En {stats.remainingWorkingDays} días restantes
            </p>
          </div>
        </div>

        {/* Proyección de Cierre */}
        <div
          id="stat-projected-units"
          className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Proyección
          </span>
          <div className="mt-1">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-extrabold tracking-tight ${
                stats.projectedSales >= stats.totalTarget ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {stats.projectedSales}
              </span>
              <span className="text-xs font-medium text-slate-600">uds</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              A fin de mes
            </p>
          </div>
        </div>

        {/* Objetivo Total */}
        <div
          id="stat-target-units"
          className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Objetivo
          </span>
          <div className="mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalTarget}
              </span>
              <span className="text-xs font-medium text-slate-600">uds</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Suma de 3 gamas
            </p>
          </div>
        </div>
      </div>

      {/* Barra de progreso de jornadas y resumen de días */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 mb-2 gap-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <CalendarClock className="w-4 h-4 text-blue-600" />
            <span>Progreso del Mes Laboral ({stats.daysProgressPercentage}%)</span>
          </div>
          <div className="flex items-center gap-3">
            <span><strong>{stats.workedDaysCount}</strong> trabajados</span>
            <span>•</span>
            <span><strong>{stats.remainingWorkingDays}</strong> restantes</span>
            <span>•</span>
            <span><strong>{stats.totalWorkingDays}</strong> totales</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, stats.daysProgressPercentage)}%` }}
          />
        </div>

        {/* Mensaje de recomendación diaria */}
        <div className="mt-3 text-xs text-slate-700 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>
            {isAchieved ? (
              <strong className="text-emerald-700">
                ¡Enhorabuena! Has superado el objetivo global del mes. Mantén el ritmo para maximizar tus incentivos.
              </strong>
            ) : stats.remainingWorkingDays > 0 ? (
              <>
                Necesitas vender <strong>{stats.requiredDailyRate.toString().replace('.', ',')} unidades por día laborable</strong> durante los {stats.remainingWorkingDays} días restantes para asegurar el 100% del objetivo.
              </>
            ) : (
              <>Última jornada del mes. Cierra todas tus ventas pendientes antes del cómputo final.</>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
