import {
  AppDataPayload,
  CampaignSettings,
  Product,
  Sale,
} from '@/types';

export const STORAGE_KEYS = {
  SETTINGS: 'team_sales_tracker_settings_v1',
  SALES: 'team_sales_tracker_sales_v1',
  PRODUCTS: 'team_sales_tracker_products_v1',
  VERSION: 'team_sales_tracker_version_v1',
};

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', name: 'HONOR Magic7 Pro', category: 'HIGH', bonus: 25, isActive: true },
  { id: 'p2', name: 'HONOR 600 Pro', category: 'HIGH', bonus: 20, isActive: true },
  { id: 'p3', name: 'HONOR 600', category: 'HIGH', bonus: 10, isActive: true },
  { id: 'p4', name: 'HONOR 200 Pro', category: 'HIGH', bonus: 15, isActive: true },
  { id: 'p5', name: 'HONOR 200', category: 'MID', bonus: 10, isActive: true },
  { id: 'p6', name: 'HONOR 400', category: 'MID', bonus: 5, isActive: true },
  { id: 'p7', name: 'HONOR 90', category: 'MID', bonus: 5, isActive: true },
  { id: 'p8', name: 'HONOR 90 Lite', category: 'ENTRY', bonus: 5, isActive: true },
  { id: 'p9', name: 'HONOR X8b', category: 'ENTRY', bonus: 5, isActive: true },
  { id: 'p10', name: 'HONOR X7b', category: 'ENTRY', bonus: 3, isActive: true },
  { id: 'p11', name: 'HONOR X6a', category: 'ENTRY', bonus: 0, isActive: true },
];

export function getDefaultSettings(): CampaignSettings {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  return {
    zone: 'Madrid Centro / Norte',
    storeName: 'MediaMarkt Castellana',
    storeCode: 'MM-28046',
    campaignName: 'Campaña TE@M Q3',
    month: currentMonth,
    year: currentYear,
    categories: {
      HIGH: {
        id: 'HIGH',
        name: 'Gama HIGH',
        target: 15,
        baseIncentive: 350,
        maxPayoutPercentage: 140,
        color: '#2563eb', // Blue
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
      },
      MID: {
        id: 'MID',
        name: 'Gama MID',
        target: 25,
        baseIncentive: 250,
        maxPayoutPercentage: 140,
        color: '#059669', // Emerald
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      },
      ENTRY: {
        id: 'ENTRY',
        name: 'Gama ENTRY',
        target: 20,
        baseIncentive: 150,
        maxPayoutPercentage: 140,
        color: '#7c3aed', // Purple
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
      },
    },
    tiers: [
      { percentage: 80, payoutRate: 80 },
      { percentage: 100, payoutRate: 100 },
      { percentage: 120, payoutRate: 120 },
      { percentage: 140, payoutRate: 140 },
    ],
    minimumIncentiveThreshold: 80,
    workDaysConfig: {
      defaultWorkDays: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
      customDayOverrides: {},
    },
    rules: [
      {
        id: 'r1',
        title: 'Reporte diario puntual',
        description: 'Las ventas deben reportarse en el sistema antes de las 22:00h de cada jornada de trabajo.',
        type: 'warning',
      },
      {
        id: 'r2',
        title: 'Consecución mínima de incentivo (80%)',
        description: 'Para devengar incentivo en una gama específica, se exige un mínimo de 80% de consecución de su objetivo.',
        type: 'info',
      },
      {
        id: 'r3',
        title: 'Bonus por producto garantizado',
        description: 'Los bonus individuales por producto se acumulan de forma directa e independiente de los objetivos globales de gama.',
        type: 'info',
      },
      {
        id: 'r4',
        title: 'Penalizaciones por falta de reporte',
        description: 'La omisión injustificada de 3 o más reportes mensuales puede congelar el cobro de la liquidación de incentivos.',
        type: 'penalty',
      },
    ],
  };
}

export function generateDemoSales(settings: CampaignSettings): Sale[] {
  const year = settings.year;
  const month = String(settings.month).padStart(2, '0');

  return [
    { id: 'demo-1', date: `${year}-${month}-02`, productId: 'p1', productName: 'HONOR Magic7 Pro', category: 'HIGH', quantity: 2, unitBonus: 25, totalBonus: 50, isDemo: true, createdAt: '2026-09-02T11:00:00Z' },
    { id: 'demo-2', date: `${year}-${month}-03`, productId: 'p5', productName: 'HONOR 200', category: 'MID', quantity: 3, unitBonus: 10, totalBonus: 30, isDemo: true, createdAt: '2026-09-03T12:00:00Z' },
    { id: 'demo-3', date: `${year}-${month}-04`, productId: 'p8', productName: 'HONOR 90 Lite', category: 'ENTRY', quantity: 2, unitBonus: 5, totalBonus: 10, isDemo: true, createdAt: '2026-09-04T16:30:00Z' },
    { id: 'demo-4', date: `${year}-${month}-05`, productId: 'p2', productName: 'HONOR 600 Pro', category: 'HIGH', quantity: 1, unitBonus: 20, totalBonus: 20, isDemo: true, createdAt: '2026-09-05T14:15:00Z' },
    { id: 'demo-5', date: `${year}-${month}-06`, productId: 'p6', productName: 'HONOR 400', category: 'MID', quantity: 4, unitBonus: 5, totalBonus: 20, isDemo: true, createdAt: '2026-09-06T18:00:00Z' },
    { id: 'demo-6', date: `${year}-${month}-08`, productId: 'p9', productName: 'HONOR X8b', category: 'ENTRY', quantity: 3, unitBonus: 5, totalBonus: 15, isDemo: true, createdAt: '2026-09-08T11:45:00Z' },
    { id: 'demo-7', date: `${year}-${month}-09`, productId: 'p3', productName: 'HONOR 600', category: 'HIGH', quantity: 2, unitBonus: 10, totalBonus: 20, isDemo: true, createdAt: '2026-09-09T17:10:00Z' },
    { id: 'demo-8', date: `${year}-${month}-10`, productId: 'p5', productName: 'HONOR 200', category: 'MID', quantity: 3, unitBonus: 10, totalBonus: 30, isDemo: true, createdAt: '2026-09-10T13:20:00Z' },
    { id: 'demo-9', date: `${year}-${month}-11`, productId: 'p10', productName: 'HONOR X7b', category: 'ENTRY', quantity: 4, unitBonus: 3, totalBonus: 12, isDemo: true, createdAt: '2026-09-11T19:00:00Z' },
    { id: 'demo-10', date: `${year}-${month}-12`, productId: 'p1', productName: 'HONOR Magic7 Pro', category: 'HIGH', quantity: 2, unitBonus: 25, totalBonus: 50, isDemo: true, createdAt: '2026-09-12T15:40:00Z' },
    { id: 'demo-11', date: `${year}-${month}-13`, productId: 'p7', productName: 'HONOR 90', category: 'MID', quantity: 3, unitBonus: 5, totalBonus: 15, isDemo: true, createdAt: '2026-09-13T16:00:00Z' },
    { id: 'demo-12', date: `${year}-${month}-15`, productId: 'p8', productName: 'HONOR 90 Lite', category: 'ENTRY', quantity: 3, unitBonus: 5, totalBonus: 15, isDemo: true, createdAt: '2026-09-15T12:30:00Z' },
    { id: 'demo-13', date: `${year}-${month}-16`, productId: 'p2', productName: 'HONOR 600 Pro', category: 'HIGH', quantity: 2, unitBonus: 20, totalBonus: 40, isDemo: true, createdAt: '2026-09-16T17:45:00Z' },
    { id: 'demo-14', date: `${year}-${month}-17`, productId: 'p5', productName: 'HONOR 200', category: 'MID', quantity: 4, unitBonus: 10, totalBonus: 40, isDemo: true, createdAt: '2026-09-17T14:50:00Z' },
    { id: 'demo-15', date: `${year}-${month}-18`, productId: 'p1', productName: 'HONOR Magic7 Pro', category: 'HIGH', quantity: 3, unitBonus: 25, totalBonus: 75, isDemo: true, createdAt: '2026-09-18T18:15:00Z' },
    { id: 'demo-16', date: `${year}-${month}-19`, productId: 'p9', productName: 'HONOR X8b', category: 'ENTRY', quantity: 4, unitBonus: 5, totalBonus: 20, isDemo: true, createdAt: '2026-09-19T13:00:00Z' },
    { id: 'demo-17', date: `${year}-${month}-20`, productId: 'p6', productName: 'HONOR 400', category: 'MID', quantity: 3, unitBonus: 5, totalBonus: 15, isDemo: true, createdAt: '2026-09-20T19:30:00Z' },
    { id: 'demo-18', date: `${year}-${month}-21`, productId: 'p4', productName: 'HONOR 200 Pro', category: 'HIGH', quantity: 2, unitBonus: 15, totalBonus: 30, isDemo: true, createdAt: '2026-09-21T11:20:00Z' },
    { id: 'demo-19', date: `${year}-${month}-22`, productId: 'p5', productName: 'HONOR 200', category: 'MID', quantity: 1, unitBonus: 10, totalBonus: 10, isDemo: true, createdAt: '2026-09-22T10:15:00Z' },
  ];
}

/**
 * DataRepository Interface
 * Diseñada para permitir intercambiar LocalStorage por Supabase / PostgreSQL
 */
export interface DataRepository {
  getSales(): Promise<Sale[]>;
  addSale(sale: Sale): Promise<void>;
  updateSale(sale: Sale): Promise<void>;
  deleteSale(id: string): Promise<void>;
  getSettings(): Promise<CampaignSettings>;
  saveSettings(settings: CampaignSettings): Promise<void>;
  getProducts(): Promise<Product[]>;
  saveProducts(products: Product[]): Promise<void>;
  exportData(): Promise<AppDataPayload>;
  importData(payload: AppDataPayload): Promise<void>;
  clearAllData(): Promise<void>;
  clearDemoData(): Promise<void>;
}

/**
 * Implementación LocalStorage del repositorio
 */
export class LocalStorageRepository implements DataRepository {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  async getSales(): Promise<Sale[]> {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SALES);
      if (!raw) {
        // Primera ejecución: cargar datos demo
        const settings = await this.getSettings();
        const demoSales = generateDemoSales(settings);
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(demoSales));
        return demoSales;
      }
      return JSON.parse(raw) as Sale[];
    } catch (e) {
      console.error('Error reading sales from localStorage:', e);
      return [];
    }
  }

  async addSale(sale: Sale): Promise<void> {
    if (!this.isBrowser()) return;
    const current = await this.getSales();
    const updated = [sale, ...current];
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updated));
  }

  async updateSale(updatedSale: Sale): Promise<void> {
    if (!this.isBrowser()) return;
    const current = await this.getSales();
    const updated = current.map((s) => (s.id === updatedSale.id ? updatedSale : s));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updated));
  }

  async deleteSale(id: string): Promise<void> {
    if (!this.isBrowser()) return;
    const current = await this.getSales();
    const updated = current.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updated));
  }

  async getSettings(): Promise<CampaignSettings> {
    if (!this.isBrowser()) return getDefaultSettings();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) {
        const defaults = getDefaultSettings();
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaults));
        return defaults;
      }
      const parsed = JSON.parse(raw);
      // Garantizar que contenga todos los campos mínimos
      const defaults = getDefaultSettings();
      return {
        ...defaults,
        ...parsed,
        categories: {
          HIGH: { ...defaults.categories.HIGH, ...(parsed.categories?.HIGH || {}) },
          MID: { ...defaults.categories.MID, ...(parsed.categories?.MID || {}) },
          ENTRY: { ...defaults.categories.ENTRY, ...(parsed.categories?.ENTRY || {}) },
        },
        workDaysConfig: {
          defaultWorkDays: parsed.workDaysConfig?.defaultWorkDays || defaults.workDaysConfig.defaultWorkDays,
          customDayOverrides: parsed.workDaysConfig?.customDayOverrides || {},
        },
      };
    } catch (e) {
      console.error('Error reading settings from localStorage:', e);
      return getDefaultSettings();
    }
  }

  async saveSettings(settings: CampaignSettings): Promise<void> {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  async getProducts(): Promise<Product[]> {
    if (!this.isBrowser()) return DEFAULT_PRODUCTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
      }
      return JSON.parse(raw) as Product[];
    } catch (e) {
      console.error('Error reading products from localStorage:', e);
      return DEFAULT_PRODUCTS;
    }
  }

  async saveProducts(products: Product[]): Promise<void> {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  async exportData(): Promise<AppDataPayload> {
    const settings = await this.getSettings();
    const sales = await this.getSales();
    const products = await this.getProducts();

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      products,
      sales,
      calendarOverrides: settings.workDaysConfig.customDayOverrides,
    };
  }

  async importData(payload: AppDataPayload): Promise<void> {
    if (!this.isBrowser()) return;
    if (payload.settings) {
      await this.saveSettings(payload.settings);
    }
    if (Array.isArray(payload.products)) {
      await this.saveProducts(payload.products);
    }
    if (Array.isArray(payload.sales)) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(payload.sales));
    }
  }

  async clearAllData(): Promise<void> {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  }

  async clearDemoData(): Promise<void> {
    if (!this.isBrowser()) return;
    const current = await this.getSales();
    const filtered = current.filter((s) => !s.isDemo);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(filtered));
  }
}

/**
 * Blueprint / Adaptador preparado para conexión a Supabase / PostgreSQL
 * Permite cambiar la implementación con inyección de dependencias sin alterar la UI.
 */
export class SupabaseRepository implements DataRepository {
  private supabaseClient: unknown = null;

  constructor(supabaseClient?: unknown) {
    this.supabaseClient = supabaseClient;
  }

  async getSales(): Promise<Sale[]> {
    // Ejemplo de implementación con supabase-js:
    // const { data, error } = await this.supabaseClient.from('sales').select('*');
    // if (error) throw error;
    // return data;
    throw new Error('SupabaseRepository no configurado. Cambie al proveedor LocalStorageRepository.');
  }

  async addSale(sale: Sale): Promise<void> {
    throw new Error('SupabaseRepository no configurado.');
  }

  async updateSale(sale: Sale): Promise<void> {
    throw new Error('SupabaseRepository no configurado.');
  }

  async deleteSale(id: string): Promise<void> {
    throw new Error('SupabaseRepository no configurado.');
  }

  async getSettings(): Promise<CampaignSettings> {
    throw new Error('SupabaseRepository no configurado.');
  }

  async saveSettings(settings: CampaignSettings): Promise<void> {
    throw new Error('SupabaseRepository no configurado.');
  }

  async getProducts(): Promise<Product[]> {
    throw new Error('SupabaseRepository no configurado.');
  }

  async saveProducts(products: Product[]): Promise<void> {
    throw new Error('SupabaseRepository no configurado.');
  }

  async exportData(): Promise<AppDataPayload> {
    throw new Error('SupabaseRepository no configurado.');
  }

  async importData(payload: AppDataPayload): Promise<void> {
    throw new Error('SupabaseRepository no configurado.');
  }

  async clearAllData(): Promise<void> {
    throw new Error('SupabaseRepository no configurado.');
  }

  async clearDemoData(): Promise<void> {
    throw new Error('SupabaseRepository no configurado.');
  }
}

// Instancia por defecto del repositorio activo
export const repository: DataRepository = new LocalStorageRepository();
