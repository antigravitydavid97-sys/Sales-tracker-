'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Info, AlertTriangle, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useSalesTracker } from '@/context/SalesTrackerContext';

export function CampaignRulesNotice() {
  const { settings } = useSalesTracker();
  const [isOpen, setIsOpen] = useState(false);

  const rules = settings.rules || [];

  return (
    <div
      id="campaign-rules-section"
      className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs mb-6"
    >
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
          aria-expanded={isOpen}
          aria-label="Alternar reglas de campaña"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Reglas de Campaña y Políticas de Reporte</span>
              <span className="text-xs font-normal text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {rules.length} directrices
              </span>
            </h2>
            <p className="text-xs text-slate-600">
              Requisitos de horario, reporte diario e información de penalizaciones
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <Link
            href="/configuracion"
            className="text-xs text-slate-600 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title="Editar reglas de campaña"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={isOpen ? 'Ocultar reglas' : 'Mostrar reglas'}
          >
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules.map((rule) => {
              const isPenalty = rule.type === 'penalty';
              const isWarning = rule.type === 'warning';

              return (
                <div
                  key={rule.id}
                  className={`p-3.5 rounded-xl border text-xs ${
                    isPenalty
                      ? 'bg-rose-50/60 border-rose-200/80 text-rose-950'
                      : isWarning
                      ? 'bg-amber-50/60 border-amber-200/80 text-amber-950'
                      : 'bg-slate-50 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isPenalty ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : isWarning ? (
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 mb-0.5">
                        {rule.title}
                      </h4>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-600 italic">
            * Nota: Las políticas y penalizaciones son informativas y no se descuentan automáticamente de tus ventas acumuladas salvo configuración explícita del supervisor.
          </p>
        </div>
      )}
    </div>
  );
}
