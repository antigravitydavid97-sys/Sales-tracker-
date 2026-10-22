'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Layers,
  Calendar,
  Gift,
  Coins,
  Package,
  Activity,
  Award,
} from 'lucide-react';
import { useSalesTracker } from '@/context/SalesTrackerContext';

const emptySubscribe = () => () => {};

const CATEGORY_COLORS: Record<string, string> = {
  HIGH: '#2563eb', // Blue
  MID: '#059669',  // Emerald
  ENTRY: '#7c3aed', // Purple
};

export function AnalyticsView() {
  const { sales, stats, settings, products } = useSalesTracker();
  const isMounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  const monthPrefix = `${settings.year}-${String(settings.month).padStart(2, '0')}`;
  const currentMonthSales = useMemo(() => {
    return sales.filter((s) => s.date.startsWith(monthPrefix));
  }, [sales, monthPrefix]);

  // Gráfico 1: Ventas Acumuladas vs Ritmo Objetivo Diario
  const cumulativeData = useMemo(() => {
    const daysInMonth = new Date(settings.year, settings.month, 0).getDate();
    const data = [];
    let runningTotal = 0;

    const targetPerDay = stats.totalWorkingDays > 0 ? stats.totalTarget / stats.totalWorkingDays : 0;
    let expectedRunning = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${settings.year}-${String(settings.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const daySales = currentMonthSales
        .filter((s) => s.date === dateStr)
        .reduce((sum, s) => sum + s.quantity, 0);

      runningTotal += daySales;

      // Comprobar si era día laborable
      const dayOfWeek = new Date(settings.year, settings.month - 1, d).getDay();
      let isWorkDay = settings.workDaysConfig.defaultWorkDays.includes(dayOfWeek);
      if (dateStr in settings.workDaysConfig.customDayOverrides) {
        isWorkDay = Boolean(settings.workDaysConfig.customDayOverrides[dateStr]);
      }

      if (isWorkDay) {
        expectedRunning = Math.min(stats.totalTarget, expectedRunning + targetPerDay);
      }

      data.push({
        day: `Día ${d}`,
        dayNum: d,
        ventasAcumuladas: runningTotal,
        ritmoObjetivo: Number(expectedRunning.toFixed(1)),
      });
    }

    return data;
  }, [settings, currentMonthSales, stats]);

  // Gráfico 2: Ventas por Gama
  const categoryData = useMemo(() => {
    const high = stats.categoriesStats.HIGH.currentSales;
    const mid = stats.categoriesStats.MID.currentSales;
    const entry = stats.categoriesStats.ENTRY.currentSales;

    return [
      { name: 'HIGH', unidades: high, objetivo: stats.categoriesStats.HIGH.target, color: CATEGORY_COLORS.HIGH },
      { name: 'MID', unidades: mid, objetivo: stats.categoriesStats.MID.target, color: CATEGORY_COLORS.MID },
      { name: 'ENTRY', unidades: entry, objetivo: stats.categoriesStats.ENTRY.target, color: CATEGORY_COLORS.ENTRY },
    ];
  }, [stats]);

  // Gráfico 3: Ventas por Día (Desglose diario)
  const dailyData = useMemo(() => {
    const map: Record<number, { day: string; HIGH: number; MID: number; ENTRY: number; total: number }> = {};
    const daysInMonth = new Date(settings.year, settings.month, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      map[d] = {
        day: `${d}`,
        HIGH: 0,
        MID: 0,
        ENTRY: 0,
        total: 0,
      };
    }

    for (const s of currentMonthSales) {
      const d = parseInt(s.date.split('-')[2], 10);
      if (map[d]) {
        map[d][s.category] += s.quantity;
        map[d].total += s.quantity;
      }
    }

    return Object.values(map);
  }, [currentMonthSales, settings]);

  // Gráfico 4: Ventas por Producto (Top)
  const productData = useMemo(() => {
    const map: Record<string, { name: string; category: string; units: number; bonus: number }> = {};

    for (const s of currentMonthSales) {
      if (!map[s.productName]) {
        map[s.productName] = {
          name: s.productName,
          category: s.category,
          units: 0,
          bonus: 0,
        };
      }
      map[s.productName].units += s.quantity;
      map[s.productName].bonus += s.totalBonus;
    }

    return Object.values(map)
      .sort((a, b) => b.units - a.units)
      .slice(0, 8); // Top 8
  }, [currentMonthSales]);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Analytics y Rendimiento de Ventas</span>
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Evolución acumulada, distribución por gamas, ritmo diario y top productos
        </p>
      </div>

      {/* Grid de Indicadores Clave */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-semibold uppercase text-slate-600 block">Total Vendido</span>
          <span className="text-lg font-bold text-slate-900">{stats.totalSales} uds</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-xs">
          <span className="text-[10px] font-semibold uppercase text-blue-600 block">Gama HIGH</span>
          <span className="text-lg font-bold text-blue-700">{stats.categoriesStats.HIGH.currentSales} uds</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <span className="text-[10px] font-semibold uppercase text-emerald-600 block">Gama MID</span>
          <span className="text-lg font-bold text-emerald-700">{stats.categoriesStats.MID.currentSales} uds</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-purple-200/80 bg-purple-50/20 shadow-xs">
          <span className="text-[10px] font-semibold uppercase text-purple-600 block">Gama ENTRY</span>
          <span className="text-lg font-bold text-purple-700">{stats.categoriesStats.ENTRY.currentSales} uds</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-semibold uppercase text-slate-600 block">Total Bonus</span>
          <span className="text-lg font-bold text-emerald-600">+{stats.totalBonus.toFixed(0)}€</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-semibold uppercase text-slate-600 block">Incentivo</span>
          <span className="text-lg font-bold text-blue-600">{stats.totalIncentive.toFixed(0)}€</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-semibold uppercase text-slate-600 block">Promedio Día</span>
          <span className="text-lg font-bold text-slate-900">{stats.currentDailyRate}</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-semibold uppercase text-slate-600 block">Proyección</span>
          <span className="text-lg font-bold text-slate-900">{stats.projectedSales} uds</span>
        </div>
      </div>

      {/* Gráficos en Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Gráfico 1: Ventas Acumuladas vs Objetivo */}
        <div
          id="chart-cumulative-sales"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Ventas Acumuladas vs Ritmo Objetivo</span>
            </h2>
            <p className="text-xs text-slate-600">
              Evolución acumulada a lo largo del mes frente a la curva objetivo
            </p>
          </div>

          <div className="h-64 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="dayNum" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value} uds`,
                      name === 'ventasAcumuladas' ? 'Ventas Acumuladas' : 'Ritmo Objetivo',
                    ]}
                    labelFormatter={(label) => `Día ${label}`}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="ventasAcumuladas"
                    name="Ventas Acumuladas"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="#3b82f6"
                    fillOpacity={0.15}
                  />
                  <Line
                    type="monotone"
                    dataKey="ritmoObjetivo"
                    name="Ritmo Objetivo"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 2: Ventas por Gama */}
        <div
          id="chart-category-comparison"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Ventas Actuales vs Objetivo por Gama</span>
            </h2>
            <p className="text-xs text-slate-600">
              Comparativa de volumen y metas en HIGH, MID y ENTRY
            </p>
          </div>

          <div className="h-64 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} unidades`, name === 'unidades' ? 'Ventas' : 'Objetivo']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="unidades" name="Ventas Conseguidas" radius={[6, 6, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar dataKey="objetivo" name="Objetivo Mensual" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 3: Ventas por Día del Mes */}
        <div
          id="chart-daily-sales"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Ventas Diarias Apiladas por Gama</span>
            </h2>
            <p className="text-xs text-slate-600">
              Actividad diaria registrada durante el mes en curso
            </p>
          </div>

          <div className="h-64 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="HIGH" stackId="a" fill={CATEGORY_COLORS.HIGH} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="MID" stackId="a" fill={CATEGORY_COLORS.MID} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="ENTRY" stackId="a" fill={CATEGORY_COLORS.ENTRY} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 4: Top Modelos Más Vendidos */}
        <div
          id="chart-product-ranking"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>Top Modelos Más Vendidos</span>
            </h2>
            <p className="text-xs text-slate-600">
              Ranking de dispositivos con mayor volumen y aporte de bonus
            </p>
          </div>

          <div className="h-64 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={productData}
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#334155' }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} uds (+${item.payload.bonus}€ bonus)`,
                      'Unidades',
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="units" name="Unidades Vendidas" fill="#2563eb" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
