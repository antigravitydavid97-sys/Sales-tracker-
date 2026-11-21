'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  Package,
  CalendarRange,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { useSalesTracker } from '@/context/SalesTrackerContext';
import { calculateWeeklyDeviceStats } from '@/lib/calculations';

const emptySubscribe = () => () => {};

const CATEGORY_COLORS: Record<string, string> = {
  HIGH: '#2563eb', // Blue
  MID: '#059669',  // Emerald
  ENTRY: '#7c3aed', // Purple
};

const DEVICE_COLORS = {
  moviles: '#2563eb', // Blue 600
  tablets: '#8b5cf6', // Violet 500
  global: '#10b981',  // Emerald 500
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function AnalyticsView() {
  const { sales, stats, settings, products, theme } = useSalesTracker();
  const isMounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isDark = theme === 'dark';

  const currentMonthName = MONTH_NAMES[(settings.month || 1) - 1] || 'Mes actual';
  const monthPrefix = `${settings.year}-${String(settings.month).padStart(2, '0')}`;
  const currentMonthSales = useMemo(() => {
    return sales.filter((s) => s.date.startsWith(monthPrefix));
  }, [sales, monthPrefix]);

  // Gráfico semanal: Todas las semanas del mes en curso (Móviles vs Tablets vs Global)
  const weeklyDeviceStats = useMemo(() => {
    return calculateWeeklyDeviceStats(sales, products, settings.year, settings.month);
  }, [sales, products, settings.year, settings.month]);

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

  const cardClass = isDark
    ? 'bg-slate-900 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200/80 text-slate-900';

  const gridStroke = isDark ? '#1e293b' : '#f1f5f9';
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderRadius: '12px',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    color: isDark ? '#f8fafc' : '#0f172a',
    fontSize: '12px',
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className={`rounded-2xl p-5 border shadow-xs transition-colors ${cardClass}`}>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Analytics y Rendimiento de Ventas</span>
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Desglose semanal (móviles, tablets y global), evolución acumulada, distribución por gamas y top productos
        </p>
      </div>

      {/* Grid de Indicadores Clave */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className={`p-3 rounded-xl border shadow-xs ${cardClass}`}>
          <span className={`text-[10px] font-semibold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Vendido</span>
          <span className="text-lg font-bold">{stats.totalSales} uds</span>
        </div>

        <div className={`p-3 rounded-xl border shadow-xs ${isDark ? 'bg-blue-950/30 border-blue-800/70' : 'bg-blue-50/20 border-blue-200/80'}`}>
          <span className="text-[10px] font-semibold uppercase text-blue-600 block">Gama HIGH</span>
          <span className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{stats.categoriesStats.HIGH.currentSales} uds</span>
        </div>

        <div className={`p-3 rounded-xl border shadow-xs ${isDark ? 'bg-emerald-950/30 border-emerald-800/70' : 'bg-emerald-50/20 border-emerald-200/80'}`}>
          <span className="text-[10px] font-semibold uppercase text-emerald-600 block">Gama MID</span>
          <span className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{stats.categoriesStats.MID.currentSales} uds</span>
        </div>

        <div className={`p-3 rounded-xl border shadow-xs ${isDark ? 'bg-purple-950/30 border-purple-800/70' : 'bg-purple-50/20 border-purple-200/80'}`}>
          <span className="text-[10px] font-semibold uppercase text-purple-600 block">Gama ENTRY</span>
          <span className={`text-lg font-bold ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>{stats.categoriesStats.ENTRY.currentSales} uds</span>
        </div>

        <div className={`p-3 rounded-xl border shadow-xs ${cardClass}`}>
          <span className={`text-[10px] font-semibold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Bonus</span>
          <span className="text-lg font-bold text-emerald-600">+{stats.totalBonus.toFixed(0)}€</span>
        </div>

        <div className={`p-3 rounded-xl border shadow-xs ${cardClass}`}>
          <span className={`text-[10px] font-semibold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Incentivo</span>
          <span className="text-lg font-bold text-blue-600">{stats.totalIncentive.toFixed(0)}€</span>
        </div>

        <div className={`p-3 rounded-xl border shadow-xs ${cardClass}`}>
          <span className={`text-[10px] font-semibold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Promedio Día</span>
          <span className="text-lg font-bold">{stats.currentDailyRate}</span>
        </div>

        <div className={`p-3 rounded-xl border shadow-xs ${cardClass}`}>
          <span className={`text-[10px] font-semibold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Proyección</span>
          <span className="text-lg font-bold">{stats.projectedSales} uds</span>
        </div>
      </div>

      {/* Gráficos en Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Gráfico Semanal: Móviles vs Tablets vs Global por cada semana del mes en curso */}
        <div
          id="chart-weekly-devices"
          className={`lg:col-span-2 rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-colors ${cardClass}`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-blue-600" />
                <span>Ventas Semanales del Mes: Móviles, Tablets y Global</span>
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Agrupación por todas las semanas de {currentMonthName} {settings.year} diferenciando móviles, tablets y total global
              </p>
            </div>

            {/* Resumen mensual por tipo de dispositivo */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                id="weekly-summary-moviles"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border ${
                  isDark
                    ? 'bg-blue-950/50 border-blue-800 text-blue-300'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Móviles: {weeklyDeviceStats.totalMoviles} uds</span>
              </span>
              <span
                id="weekly-summary-tablets"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border ${
                  isDark
                    ? 'bg-violet-950/50 border-violet-800 text-violet-300'
                    : 'bg-violet-50 border-violet-200 text-violet-700'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablets: {weeklyDeviceStats.totalTablets} uds</span>
              </span>
              <span
                id="weekly-summary-global"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border ${
                  isDark
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Global: {weeklyDeviceStats.totalGlobal} uds</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyDeviceStats.weeks}
                  margin={{ top: 10, right: 16, left: -16, bottom: 5 }}
                  barGap={6}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="axisLabel"
                    tickLine={false}
                    tick={{ fontSize: 11, fill: tickColor, fontWeight: 600 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: tickColor }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={(_, payload) => {
                      const item = payload?.[0]?.payload;
                      return item
                        ? `${item.weekLabel} (${item.dateRangeLabel})`
                        : '';
                    }}
                    formatter={(value: unknown, name: unknown) => [`${value} uds`, String(name)]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar
                    dataKey="moviles"
                    name="Móviles"
                    fill={DEVICE_COLORS.moviles}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="tablets"
                    name="Tablets"
                    fill={DEVICE_COLORS.tablets}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="global"
                    name="Global"
                    fill={DEVICE_COLORS.global}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Detalle numérico por semana */}
          <div
            className={`mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}
          >
            {weeklyDeviceStats.weeks.map((week) => (
              <div
                key={week.weekNumber}
                id={`weekly-breakdown-card-${week.weekNumber}`}
                className={`p-3 rounded-xl border text-xs ${
                  isDark
                    ? 'bg-slate-800/60 border-slate-700/80'
                    : 'bg-slate-50/80 border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold">{week.weekLabel}</span>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {week.dateRangeLabel}
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-semibold">Móviles</span>
                    <span className="font-bold">{week.moviles} uds</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-violet-600 font-semibold">Tablets</span>
                    <span className="font-bold">{week.tablets} uds</span>
                  </div>
                  <div
                    className={`flex items-center justify-between pt-1 border-t ${
                      isDark ? 'border-slate-700' : 'border-slate-200/80'
                    }`}
                  >
                    <span className="text-emerald-600 font-bold">Global</span>
                    <span className="font-extrabold">{week.global} uds</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 1: Ventas Acumuladas vs Objetivo */}
        <div
          id="chart-cumulative-sales"
          className={`rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-colors ${cardClass}`}
        >
          <div className="mb-4">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Ventas Acumuladas vs Ritmo Objetivo</span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Evolución acumulada a lo largo del mes frente a la curva objetivo
            </p>
          </div>

          <div className="h-64 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="dayNum" tickLine={false} tick={{ fontSize: 11, fill: tickColor }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11, fill: tickColor }} />
                  <Tooltip
                    formatter={(value: unknown, name: unknown) => [
                      `${value} uds`,
                      name === 'ventasAcumuladas' ? 'Ventas Acumuladas' : 'Ritmo Objetivo',
                    ]}
                    labelFormatter={(label) => `Día ${label}`}
                    contentStyle={tooltipStyle}
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
          className={`rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-colors ${cardClass}`}
        >
          <div className="mb-4">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Ventas Actuales vs Objetivo por Gama</span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Comparativa de volumen y metas en HIGH, MID y ENTRY
            </p>
          </div>

          <div className="h-64 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 12, fill: tickColor, fontWeight: 600 }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11, fill: tickColor }} />
                  <Tooltip
                    formatter={(val: unknown, name: unknown) => [`${val} unidades`, name === 'unidades' ? 'Ventas' : 'Objetivo']}
                    contentStyle={tooltipStyle}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="unidades" name="Ventas Conseguidas" radius={[6, 6, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar dataKey="objetivo" name="Objetivo Mensual" fill={isDark ? '#334155' : '#cbd5e1'} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 3: Ventas por Día del Mes */}
        <div
          id="chart-daily-sales"
          className={`rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-colors ${cardClass}`}
        >
          <div className="mb-4">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Ventas Diarias Apiladas por Gama</span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Actividad diaria registrada durante el mes en curso
            </p>
          </div>

          <div className="h-64 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11, fill: tickColor }} />
                  <Tooltip contentStyle={tooltipStyle} />
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
          className={`rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-colors ${cardClass}`}
        >
          <div className="mb-4">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>Top Modelos Más Vendidos</span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                  <XAxis type="number" tickLine={false} tick={{ fontSize: 11, fill: tickColor }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    tick={{ fontSize: 11, fill: tickColor }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(val: unknown, _name: unknown, item: { payload?: { bonus?: number } }) => [
                      `${val} uds (+${item?.payload?.bonus ?? 0}€ bonus)`,
                      'Unidades',
                    ]}
                    contentStyle={tooltipStyle}
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

