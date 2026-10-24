export type CategoryId = 'HIGH' | 'MID' | 'ENTRY';

export interface CategoryConfig {
  id: CategoryId;
  name: string;
  target: number;             // Objetivo de unidades
  baseIncentive: number;      // Incentivo base en € al 100%
  maxPayoutPercentage: number;// Máximo porcentaje de pago (e.g. 140%)
  color: string;              // Color visual
  badgeColor: string;
}

export interface IncentiveTier {
  percentage: number;         // e.g. 80, 100, 120, 140
  payoutRate: number;         // e.g. 80, 100, 120, 140 (% of base incentive)
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  bonus: number;              // Bonus adicional por unidad vendida (€)
  isActive?: boolean;
}

export interface Sale {
  id: string;
  date: string;               // YYYY-MM-DD
  productId: string;
  productName: string;
  category: CategoryId;
  quantity: number;
  unitBonus: number;          // Bonus unitario en el momento de la venta
  totalBonus: number;         // quantity * unitBonus
  notes?: string;
  createdAt: string;          // ISO timestamp
  isDemo?: boolean;           // Si proviene de datos de ejemplo
}

export interface CalendarDay {
  date: string;               // YYYY-MM-DD
  dayOfMonth: number;
  dayOfWeek: number;          // 0 = Sunday, 1 = Monday ... 6 = Saturday
  isWorkingDay: boolean;
  notes?: string;
}

export interface CampaignRule {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'penalty';
}

export type MilestoneLevel = 80 | 100 | 120;

export interface MilestoneNotificationLevelConfig {
  enabled: boolean;
  customMessage: string;
}

export type MilestoneNotificationsConfig = Record<MilestoneLevel, MilestoneNotificationLevelConfig>;

export interface CampaignSettings {
  zone: string;               // Zona / Territorio
  storeName: string;          // Nombre tienda
  storeCode: string;          // Código tienda
  campaignName: string;       // Campaña (ej. Campaña Primavera, Campaña Honor)
  month: number;              // 1-12
  year: number;               // ej. 2026
  
  categories: Record<CategoryId, CategoryConfig>;
  tiers: IncentiveTier[];     // Tramos de consecución (80%, 100%, 120%, 140%)
  minimumIncentiveThreshold: number; // Mínimo de consecución para cobrar (ej. 80%)
  
  workDaysConfig: {
    defaultWorkDays: number[]; // Días de la semana que son laborables por defecto [1, 2, 3, 4, 5, 6]
    customDayOverrides: Record<string, boolean>; // 'YYYY-MM-DD': isWorkingDay
  };

  rules: CampaignRule[];
  milestoneNotifications: MilestoneNotificationsConfig;
}

export interface CategoryIncentiveResult {
  categoryId: CategoryId;
  categoryName: string;
  target: number;
  currentSales: number;
  progressPercentage: number;
  payoutPercentage: number;
  baseIncentive: number;
  estimatedIncentive: number;
  isEligible: boolean;        // Ha alcanzado el umbral mínimo (ej. 80%)
}

export interface DashboardStats {
  totalSales: number;
  totalTarget: number;
  overallProgress: number;     // %
  
  // Ritmo y proyección
  workedDaysCount: number;    // Días laborables transcurridos hasta hoy
  totalWorkingDays: number;   // Total días laborables del mes
  remainingWorkingDays: number;
  daysProgressPercentage: number;
  
  currentDailyRate: number;   // Ventas / días laborables transcurridos
  requiredDailyRate: number;  // (Objetivo - Ventas) / días laborables restantes
  projectedSales: number;     // Proyección de cierre
  rateStatus: 'sufficient' | 'needs_boost' | 'achieved';
  rateDifference: number;     // Diferencia entre ritmo actual y requerido
  
  // Incentivos y bonus
  categoriesStats: Record<CategoryId, CategoryIncentiveResult>;
  totalIncentive: number;
  totalBonus: number;
  totalEstimatedEarnings: number; // totalIncentive + totalBonus
}

export interface AppDataPayload {
  version: string;
  exportedAt: string;
  settings: CampaignSettings;
  products: Product[];
  sales: Sale[];
  calendarOverrides: Record<string, boolean>;
}
