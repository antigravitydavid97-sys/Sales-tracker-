'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Flame,
  CheckCircle2,
  Lock,
  BellRing,
  BellOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSalesTracker } from '@/context/SalesTrackerContext';
import { DEFAULT_MILESTONE_NOTIFICATIONS } from '@/lib/storage';

export function MilestoneNotification() {
  const { stats, settings, activeMilestone, triggerMilestoneToast } = useSalesTracker();
  const [isMinimized, setIsMinimized] = useState(false);

  const milestoneNotifications = settings.milestoneNotifications || DEFAULT_MILESTONE_NOTIFICATIONS;
  const enabled80 = milestoneNotifications[80]?.enabled ?? true;
  const enabled100 = milestoneNotifications[100]?.enabled ?? true;
  const enabled120 = milestoneNotifications[120]?.enabled ?? true;

  // Si todas las alertas visuales de hitos están deshabilitadas, no mostrar el banner
  if (!enabled80 && !enabled100 && !enabled120) {
    return null;
  }

  const progress = stats.overallProgress;
  const target80Units = Math.ceil(stats.totalTarget * 0.8);
  const target100Units = stats.totalTarget;
  const target120Units = Math.ceil(stats.totalTarget * 1.2);

  const reached80 = progress >= 80;
  const reached100 = progress >= 100;
  const reached120 = progress >= 120;

  const customMsg80 =
    milestoneNotifications[80]?.customMessage?.trim() || DEFAULT_MILESTONE_NOTIFICATIONS[80].customMessage;
  const customMsg100 =
    milestoneNotifications[100]?.customMessage?.trim() || DEFAULT_MILESTONE_NOTIFICATIONS[100].customMessage;
  const customMsg120 =
    milestoneNotifications[120]?.customMessage?.trim() || DEFAULT_MILESTONE_NOTIFICATIONS[120].customMessage;

  // Configuración visual dinámica según el hito activo y habilitado (80%, 100%, 120%)
  const bannerConfig =
    activeMilestone === 120
      ? {
          containerClass:
            'bg-gradient-to-r from-amber-50 via-emerald-50/70 to-amber-50 border-amber-300 text-slate-900',
          iconBgClass: 'bg-amber-500 text-white shadow-sm shadow-amber-500/30',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
          badgeText: 'HITO 120% ALCANZADO • SOBRECUMPLIMIENTO',
          title: customMsg120,
          description: `Progreso actual: ${progress}% (${stats.totalSales} de ${stats.totalTarget} unidades vendidas). Bonificación estimada: ${stats.totalEstimatedEarnings.toFixed(2)} €.`,
          Icon: Flame,
        }
      : activeMilestone === 100
      ? {
          containerClass:
            'bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border-emerald-300 text-slate-900',
          iconBgClass: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          badgeText: 'HITO 100% CONSEGUIDO • OBJETIVO CUMPLIDO',
          title: customMsg100,
          description: `Progreso actual: ${progress}% (${stats.totalSales} de ${stats.totalTarget} unidades registradas). Te faltan ${Math.max(0, target120Units - stats.totalSales)} unidades para el hito del 120%.`,
          Icon: Trophy,
        }
      : activeMilestone === 80
      ? {
          containerClass:
            'bg-gradient-to-r from-blue-50 via-indigo-50/60 to-blue-50 border-blue-300 text-slate-900',
          iconBgClass: 'bg-blue-600 text-white shadow-sm shadow-blue-600/30',
          badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
          badgeText: 'HITO 80% DESBLOQUEADO • UMBRAL DE COBRO ACTIVO',
          title: customMsg80,
          description: `Progreso actual: ${progress}% (${stats.totalSales} de ${stats.totalTarget} unidades). Estás a solo ${Math.max(0, target100Units - stats.totalSales)} unidades de lograr el 100% del objetivo mensual.`,
          Icon: Award,
        }
      : {
          containerClass: 'bg-white border-slate-200/80 text-slate-900',
          iconBgClass: 'bg-slate-100 text-slate-700',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
          badgeText: 'PROGRESO DE HITOS MENSUALES (80% • 100% • 120%)',
          title: `En camino al próximo hito habilitado (${progress}% actual)`,
          description: `Llevas ${stats.totalSales} de ${stats.totalTarget} unidades. Te faltan ${Math.max(0, target80Units - stats.totalSales)} unidades para alcanzar el 80% y desbloquear los incentivos.`,
          Icon: Award,
        };

  const ActiveIcon = bannerConfig.Icon;

  const milestones = [
    {
      threshold: 80 as const,
      label: 'Hito 80%',
      subtitle: 'Umbral Mínimo',
      unitsRequired: target80Units,
      reached: reached80,
      enabled: enabled80,
      customMessage: customMsg80,
      activeColor: 'border-blue-300 bg-blue-50/90 text-blue-900',
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      threshold: 100 as const,
      label: 'Hito 100%',
      subtitle: 'Meta Mensual',
      unitsRequired: target100Units,
      reached: reached100,
      enabled: enabled100,
      customMessage: customMsg100,
      activeColor: 'border-emerald-300 bg-emerald-50/90 text-emerald-900',
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      threshold: 120 as const,
      label: 'Hito 120%',
      subtitle: 'Sobrecumplimiento',
      unitsRequired: target120Units,
      reached: reached120,
      enabled: enabled120,
      customMessage: customMsg120,
      activeColor: 'border-amber-300 bg-amber-50/90 text-amber-900',
      badgeColor: 'bg-amber-500 text-white',
    },
  ];

  return (
    <div
      id="dashboard-milestone-notification"
      role="status"
      aria-live="polite"
      className={`rounded-2xl border p-4 md:p-5 shadow-xs transition-all duration-300 ${bannerConfig.containerClass}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Mensaje principal de notificación del hito */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${bannerConfig.iconBgClass}`}
          >
            <ActiveIcon className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${bannerConfig.badgeClass}`}
              >
                {bannerConfig.badgeText}
              </span>
              {activeMilestone && (
                <button
                  type="button"
                  onClick={() => triggerMilestoneToast(activeMilestone)}
                  id="milestone-trigger-toast-btn"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
                  title="Mostrar aviso emergente del hito alcanzado"
                >
                  <BellRing className="w-3 h-3 text-amber-600" />
                  <span>Ver aviso</span>
                </button>
              )}
            </div>

            <h2
              id="dashboard-milestone-custom-message"
              className="text-sm md:text-base font-extrabold text-slate-900 leading-snug"
            >
              {bannerConfig.title}
            </h2>

            {!isMinimized && (
              <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">
                {bannerConfig.description}
              </p>
            )}
          </div>
        </div>

        {/* Botón minimizar en móvil/escritorio */}
        <div className="flex items-center justify-end lg:self-start shrink-0">
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-black/5 transition-colors cursor-pointer"
            aria-label={isMinimized ? 'Expandir detalles de hitos' : 'Minimizar detalles de hitos'}
          >
            <span>{isMinimized ? 'Ver escalones' : 'Ocultar escalones'}</span>
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Escalones de Hitos (80%, 100%, 120%) */}
      {!isMinimized && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t border-slate-200/60">
          {milestones.map((m) => {
            const remaining = Math.max(0, m.unitsRequired - stats.totalSales);
            const isHighlighted = m.reached && m.enabled;
            return (
              <div
                key={m.threshold}
                id={`milestone-badge-${m.threshold}`}
                onClick={() => isHighlighted && triggerMilestoneToast(m.threshold)}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                  isHighlighted
                    ? `${m.activeColor} shadow-2xs cursor-pointer hover:brightness-98`
                    : !m.enabled
                    ? 'bg-slate-50/60 border-slate-200/60 text-slate-400 opacity-75'
                    : 'bg-white/70 border-slate-200/80 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isHighlighted ? m.badgeColor : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {!m.enabled ? (
                      <BellOff className="w-3.5 h-3.5" />
                    ) : m.reached ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold">{m.label}</span>
                      <span className="text-[10px] opacity-80 font-medium">• {m.subtitle}</span>
                    </div>
                    <p className="text-[11px] font-medium opacity-90">
                      Meta: <strong>{m.unitsRequired} uds</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {!m.enabled ? (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-600 text-[10px] font-semibold">
                      Silenciado
                    </span>
                  ) : m.reached ? (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-white/90 text-[10px] font-extrabold uppercase tracking-wide shadow-2xs">
                      ¡Logrado!
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-600">
                      Faltan {remaining} uds
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

