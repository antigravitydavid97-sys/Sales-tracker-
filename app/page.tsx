'use client';

import React from 'react';
import { HeaderSummary } from '@/components/dashboard/HeaderSummary';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { PaceControl } from '@/components/dashboard/PaceControl';
import { CategoryCards } from '@/components/dashboard/CategoryCards';
import { BonusSummary } from '@/components/dashboard/BonusSummary';
import { CalendarWidget } from '@/components/dashboard/CalendarWidget';
import { CampaignRulesNotice } from '@/components/dashboard/CampaignRulesNotice';

export default function DashboardPage() {
  return (
    <div id="dashboard-page-container" className="space-y-6">
      {/* 1. Cabecera con datos de tienda y acciones */}
      <HeaderSummary />

      {/* 2. Resumen General: Las 4 tarjetas clave de ventas */}
      <MetricCards />

      {/* 3. Control del Ritmo de Ventas y Proyección */}
      <PaceControl />

      {/* 4. Rendimiento e Incentivos por Gama (HIGH, MID, ENTRY) */}
      <CategoryCards />

      {/* 5. Liquidación Estimada y Bonus por Producto */}
      <BonusSummary />

      {/* 6. Calendario de Días Laborables y Festivos */}
      <CalendarWidget />

      {/* 7. Reglas de Campaña y Políticas de Reporte */}
      <CampaignRulesNotice />
    </div>
  );
}
