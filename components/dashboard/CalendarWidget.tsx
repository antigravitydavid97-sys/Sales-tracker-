'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Check, X, Info, RotateCcw } from 'lucide-react';
import { useSalesTracker } from '@/context/SalesTrackerContext';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function CalendarWidget() {
  const { settings, stats, toggleCalendarDay, updateSettings } = useSalesTracker();
  const [selectedDayInfo, setSelectedDayInfo] = useState<string | null>(null);

  const year = settings.year;
  const month = settings.month; // 1-12
  const daysInMonth = new Date(year, month, 0).getDate();

  // Primer día del mes: 0 = domingo, 1 = lunes ... 6 = sábado
  // Convertir a lunes = 0, domingo = 6
  const firstDayRaw = new Date(year, month - 1, 1).getDay();
  const firstDayOffset = firstDayRaw === 0 ? 6 : firstDayRaw - 1;

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDateNum = today.getDate();

  const handleDayClick = async (dayNumber: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    
    // Determinar estado actual
    const dayOfWeek = new Date(year, month - 1, dayNumber).getDay();
    let currentIsWorking = true;
    if (dateStr in settings.workDaysConfig.customDayOverrides) {
      currentIsWorking = Boolean(settings.workDaysConfig.customDayOverrides[dateStr]);
    } else {
      currentIsWorking = settings.workDaysConfig.defaultWorkDays.includes(dayOfWeek);
    }

    // Alternar
    await toggleCalendarDay(dateStr, !currentIsWorking);
    setSelectedDayInfo(`Día ${dayNumber} marcado como ${!currentIsWorking ? 'LABORABLE' : 'LIBRE/FESTIVO'}`);
    setTimeout(() => setSelectedDayInfo(null), 2500);
  };

  const handleResetCalendar = async () => {
    const cleared = {
      ...settings,
      workDaysConfig: {
        ...settings.workDaysConfig,
        customDayOverrides: {},
      },
    };
    await updateSettings(cleared);
  };

  return (
    <div
      id="calendar-schedule-widget"
      className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>Calendario de Días Laborables</span>
          </h2>
          <p className="text-xs text-slate-600">
            Haz clic en cualquier día para cambiarlo entre <strong>Laborable</strong> y <strong>Libre / Festivo</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Laborable</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span>Libre/Festivo</span>
          </div>
          <button
            onClick={handleResetCalendar}
            id="reset-calendar-days-btn"
            className="flex items-center gap-1 ml-2 text-slate-600 hover:text-slate-800 text-[11px] underline"
            title="Restablecer calendario a valores por defecto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      {selectedDayInfo && (
        <div className="mb-3 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium animate-in fade-in">
          {selectedDayInfo}
        </div>
      )}

      {/* Grid del Calendario */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[280px]">
          {/* Cabecera de días de la semana */}
          <div className="grid grid-cols-7 gap-1 md:gap-1.5 mb-1.5 text-center">
            {WEEKDAYS.map((name) => (
              <span key={name} className="text-[11px] font-semibold text-slate-600 py-1">
                {name}
              </span>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1 md:gap-1.5">
            {/* Espacios vacíos antes del día 1 */}
            {Array.from({ length: firstDayOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-10 md:h-12 rounded-xl bg-transparent" />
            ))}

            {/* Días del mes */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayOfWeek = new Date(year, month - 1, dayNum).getDay();

              let isWorking = true;
              if (dateStr in settings.workDaysConfig.customDayOverrides) {
                isWorking = Boolean(settings.workDaysConfig.customDayOverrides[dateStr]);
              } else {
                isWorking = settings.workDaysConfig.defaultWorkDays.includes(dayOfWeek);
              }

              const isToday = isCurrentMonth && dayNum === todayDateNum;
              const isPast = isCurrentMonth ? dayNum < todayDateNum : false;

              return (
                <button
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  id={`calendar-day-btn-${dayNum}`}
                  className={`h-11 md:h-13 rounded-xl p-1 md:p-1.5 flex flex-col justify-between items-center transition-all cursor-pointer relative select-none ${
                    isToday
                      ? 'ring-2 ring-blue-600 ring-offset-1 font-bold'
                      : ''
                  } ${
                    isWorking
                      ? 'bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/60 text-blue-900'
                      : 'bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-600'
                  }`}
                  aria-label={`Día ${dayNum}, ${isWorking ? 'Laborable' : 'Libre'}`}
                >
                  <div className="flex items-center justify-between w-full px-0.5">
                    <span className="text-xs font-semibold">{dayNum}</span>
                    {isToday && (
                      <span className="text-[9px] bg-blue-600 text-white px-1 rounded-sm leading-tight uppercase font-bold">
                        Hoy
                      </span>
                    )}
                  </div>

                  <div className="w-full flex justify-center pb-0.5">
                    {isWorking ? (
                      <span className="text-[10px] text-blue-700 font-medium hidden sm:inline">
                        Laborable
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-medium hidden sm:inline">
                        Libre
                      </span>
                    )}
                    <span className="sm:hidden">
                      {isWorking ? (
                        <Check className="w-3 h-3 text-blue-600" />
                      ) : (
                        <X className="w-3 h-3 text-slate-600" />
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resumen numérico inferior */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs text-slate-600">
        <div className="p-2 bg-slate-50 rounded-lg">
          <span className="block font-bold text-slate-800 text-sm">{stats.totalWorkingDays}</span>
          <span className="text-[11px] text-slate-600">Días Laborables Totales</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          <span className="block font-bold text-blue-700 text-sm">{stats.workedDaysCount}</span>
          <span className="text-[11px] text-slate-600">Transcurridos</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          <span className="block font-bold text-slate-800 text-sm">{stats.remainingWorkingDays}</span>
          <span className="text-[11px] text-slate-600">Restantes</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          <span className="block font-bold text-emerald-700 text-sm">{stats.daysProgressPercentage}%</span>
          <span className="text-[11px] text-slate-600">% Jornadas Realizadas</span>
        </div>
      </div>
    </div>
  );
}
