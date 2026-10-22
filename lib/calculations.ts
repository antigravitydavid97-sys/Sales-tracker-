import {
  CategoryId,
  CampaignSettings,
  CategoryIncentiveResult,
  DashboardStats,
  IncentiveTier,
  Product,
  Sale,
} from '@/types';

/**
 * Calcula el porcentaje de avance respecto a un objetivo.
 */
export function calculateProgress(current: number, target: number): number {
  if (target <= 0) return current > 0 ? 100 : 0;
  return Number(((current / target) * 100).toFixed(1));
}

/**
 * Calcula el porcentaje de pago del incentivo según los tramos configurados.
 * Sigue la regla:
 * - Menor que el umbral mínimo (default 80%) = 0% pago.
 * - En el umbral mínimo hasta el objetivo: escala proporcionalmente (o por tramos).
 * - Entre 100% y 120%: escala al siguiente tramo.
 * - Máximo topado al maxPayoutPercentage (ej. 140%).
 */
export function calculatePayoutPercentage(
  progressPercentage: number,
  tiers: IncentiveTier[] = [
    { percentage: 80, payoutRate: 80 },
    { percentage: 100, payoutRate: 100 },
    { percentage: 120, payoutRate: 120 },
    { percentage: 140, payoutRate: 140 },
  ],
  minimumThreshold: number = 80,
  maxPayoutPercentage: number = 140
): number {
  if (progressPercentage < minimumThreshold) {
    return 0;
  }

  // Ordenar tramos ascendentemente
  const sortedTiers = [...tiers].sort((a, b) => a.percentage - b.percentage);
  
  if (sortedTiers.length === 0) {
    return Math.min(progressPercentage, maxPayoutPercentage);
  }

  // Si supera el tramo superior o igual
  const highestTier = sortedTiers[sortedTiers.length - 1];
  if (progressPercentage >= highestTier.percentage) {
    return Math.min(highestTier.payoutRate, maxPayoutPercentage);
  }

  // Si está por debajo del primer tramo definido
  const lowestTier = sortedTiers[0];
  if (progressPercentage <= lowestTier.percentage) {
    return lowestTier.payoutRate;
  }

  // Interpolar entre los dos tramos circundantes
  for (let i = 0; i < sortedTiers.length - 1; i++) {
    const currentTier = sortedTiers[i];
    const nextTier = sortedTiers[i + 1];

    if (progressPercentage >= currentTier.percentage && progressPercentage <= nextTier.percentage) {
      const rangeProgress = nextTier.percentage - currentTier.percentage;
      const rangePayout = nextTier.payoutRate - currentTier.payoutRate;
      const delta = progressPercentage - currentTier.percentage;
      const ratio = rangeProgress > 0 ? delta / rangeProgress : 0;
      const calculated = currentTier.payoutRate + ratio * rangePayout;
      return Number(Math.min(calculated, maxPayoutPercentage).toFixed(1));
    }
  }

  return Number(Math.min(progressPercentage, maxPayoutPercentage).toFixed(1));
}

/**
 * Calcula el incentivo estimado para una gama individual.
 */
export function calculateCategoryIncentive(
  categoryId: CategoryId,
  currentSales: number,
  settings: CampaignSettings
): CategoryIncentiveResult {
  const config = settings.categories[categoryId] || {
    id: categoryId,
    name: categoryId,
    target: 0,
    baseIncentive: 0,
    maxPayoutPercentage: 140,
    color: 'blue',
    badgeColor: 'bg-blue-100 text-blue-800',
  };

  const progressPercentage = calculateProgress(currentSales, config.target);
  const isEligible = progressPercentage >= (settings.minimumIncentiveThreshold ?? 80);
  
  const payoutPercentage = calculatePayoutPercentage(
    progressPercentage,
    settings.tiers,
    settings.minimumIncentiveThreshold ?? 80,
    config.maxPayoutPercentage ?? 140
  );

  const estimatedIncentive = isEligible
    ? Number(((config.baseIncentive * payoutPercentage) / 100).toFixed(2))
    : 0;

  return {
    categoryId,
    categoryName: config.name,
    target: config.target,
    currentSales,
    progressPercentage,
    payoutPercentage,
    baseIncentive: config.baseIncentive,
    estimatedIncentive,
    isEligible,
  };
}

/**
 * Calcula la suma total de incentivos de todas las gamas.
 */
export function calculateTotalIncentive(
  categoryResults: Record<CategoryId, CategoryIncentiveResult>
): number {
  return Number(
    Object.values(categoryResults)
      .reduce((sum, cat) => sum + cat.estimatedIncentive, 0)
      .toFixed(2)
  );
}

/**
 * Calcula la proyección de ventas a fin de mes según días laborables trabajados.
 * Formula: (Ventas Actuales / Días Trabajados) * Días Laborables Totales
 */
export function calculateProjection(
  currentSales: number,
  workedDays: number,
  totalWorkingDays: number
): number {
  if (workedDays <= 0 || totalWorkingDays <= 0) {
    return currentSales;
  }
  const rate = currentSales / workedDays;
  const projected = rate * totalWorkingDays;
  return Number(projected.toFixed(1));
}

/**
 * Calcula el ritmo necesario de ventas diarias para alcanzar el objetivo restante.
 * Formula: (Objetivo - Ventas Actuales) / Días Laborables Restantes
 */
export function calculateRequiredDailyRate(
  remainingUnits: number,
  remainingDays: number
): number {
  if (remainingUnits <= 0) return 0;
  if (remainingDays <= 0) return remainingUnits;
  return Number((remainingUnits / remainingDays).toFixed(1));
}

/**
 * Obtiene información de los días laborables del mes:
 * - totalWorkingDays
 * - workedDays (días laborables hasta la fecha de referencia inclusive)
 * - remainingWorkingDays
 * - daysProgressPercentage
 */
export function calculateCalendarStats(
  year: number,
  month: number, // 1-12
  workDaysConfig: CampaignSettings['workDaysConfig'],
  referenceDate: Date = new Date()
) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayYear = referenceDate.getFullYear();
  const todayMonth = referenceDate.getMonth() + 1;
  const todayDate = referenceDate.getDate();

  let totalWorkingDays = 0;
  let workedDaysCount = 0;
  let remainingWorkingDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 1 is Monday...
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Determinar si es laborable: override manual manda, si no el default
    let isWorking = true;
    if (dateStr in workDaysConfig.customDayOverrides) {
      isWorking = Boolean(workDaysConfig.customDayOverrides[dateStr]);
    } else {
      isWorking = workDaysConfig.defaultWorkDays.includes(dayOfWeek);
    }

    if (isWorking) {
      totalWorkingDays++;

      const isPastOrToday =
        year < todayYear ||
        (year === todayYear && month < todayMonth) ||
        (year === todayYear && month === todayMonth && d <= todayDate);

      if (isPastOrToday) {
        workedDaysCount++;
      } else {
        remainingWorkingDays++;
      }
    }
  }

  const daysProgressPercentage =
    totalWorkingDays > 0 ? Number(((workedDaysCount / totalWorkingDays) * 100).toFixed(1)) : 0;

  return {
    totalWorkingDays,
    workedDaysCount,
    remainingWorkingDays,
    daysProgressPercentage,
    daysInMonth,
  };
}

/**
 * Calcula todas las estadísticas combinadas para el Dashboard.
 */
export function calculateDashboardStats(
  sales: Sale[],
  settings: CampaignSettings,
  products: Product[],
  referenceDate: Date = new Date()
): DashboardStats {
  // Filtrar ventas del mes y año correspondientes
  const monthPrefix = `${settings.year}-${String(settings.month).padStart(2, '0')}`;
  const currentMonthSales = sales.filter((s) => s.date.startsWith(monthPrefix));

  // Ventas agrupadas por gama
  const categorySalesMap: Record<CategoryId, number> = {
    HIGH: 0,
    MID: 0,
    ENTRY: 0,
  };

  let totalSales = 0;
  let totalBonus = 0;

  for (const sale of currentMonthSales) {
    const qty = Number(sale.quantity) || 0;
    totalSales += qty;
    if (sale.category && sale.category in categorySalesMap) {
      categorySalesMap[sale.category] += qty;
    }
    totalBonus += Number(sale.totalBonus) || 0;
  }

  // Objetivo total
  const totalTarget =
    (settings.categories.HIGH?.target || 0) +
    (settings.categories.MID?.target || 0) +
    (settings.categories.ENTRY?.target || 0);

  const overallProgress = calculateProgress(totalSales, totalTarget);

  // Días laborables
  const calendar = calculateCalendarStats(
    settings.year,
    settings.month,
    settings.workDaysConfig,
    referenceDate
  );

  // Ritmos
  const currentDailyRate =
    calendar.workedDaysCount > 0
      ? Number((totalSales / calendar.workedDaysCount).toFixed(1))
      : 0;

  const remainingUnits = Math.max(0, totalTarget - totalSales);
  const requiredDailyRate = calculateRequiredDailyRate(
    remainingUnits,
    calendar.remainingWorkingDays
  );

  const projectedSales = Math.round(
    calculateProjection(totalSales, calendar.workedDaysCount, calendar.totalWorkingDays)
  );

  let rateStatus: 'sufficient' | 'needs_boost' | 'achieved' = 'sufficient';
  if (totalSales >= totalTarget && totalTarget > 0) {
    rateStatus = 'achieved';
  } else if (currentDailyRate >= requiredDailyRate) {
    rateStatus = 'sufficient';
  } else {
    rateStatus = 'needs_boost';
  }

  const rateDifference = Number((currentDailyRate - requiredDailyRate).toFixed(1));

  // Cálculo de incentivos por gama
  const categoriesStats: Record<CategoryId, CategoryIncentiveResult> = {
    HIGH: calculateCategoryIncentive('HIGH', categorySalesMap.HIGH, settings),
    MID: calculateCategoryIncentive('MID', categorySalesMap.MID, settings),
    ENTRY: calculateCategoryIncentive('ENTRY', categorySalesMap.ENTRY, settings),
  };

  const totalIncentive = calculateTotalIncentive(categoriesStats);
  const totalEstimatedEarnings = Number((totalIncentive + totalBonus).toFixed(2));

  return {
    totalSales,
    totalTarget,
    overallProgress,
    workedDaysCount: calendar.workedDaysCount,
    totalWorkingDays: calendar.totalWorkingDays,
    remainingWorkingDays: calendar.remainingWorkingDays,
    daysProgressPercentage: calendar.daysProgressPercentage,
    currentDailyRate,
    requiredDailyRate,
    projectedSales,
    rateStatus,
    rateDifference,
    categoriesStats,
    totalIncentive,
    totalBonus: Number(totalBonus.toFixed(2)),
    totalEstimatedEarnings,
  };
}
