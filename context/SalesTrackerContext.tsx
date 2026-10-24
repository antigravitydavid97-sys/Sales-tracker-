'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  CampaignSettings,
  CategoryId,
  DashboardStats,
  Product,
  Sale,
} from '@/types';
import { calculateDashboardStats } from '@/lib/calculations';
import { exportSalesToCSV, CSVExportOptions } from '@/lib/csv';
import {
  DEFAULT_MILESTONE_NOTIFICATIONS,
  getDefaultSettings,
  repository,
} from '@/lib/storage';
import {
  getAdminSession,
  saveAdminSession,
  verifyAdminPassword,
  setStoredAdminPassword,
} from '@/lib/auth';

interface SalesTrackerContextType {
  sales: Sale[];
  products: Product[];
  settings: CampaignSettings;
  stats: DashboardStats;
  loading: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' | 'milestone' } | null;
  hasDemoData: boolean;
  activeMilestone: 80 | 100 | 120 | null;
  triggerMilestoneToast: (milestone: 80 | 100 | 120) => void;
  dismissToast: () => void;
  
  // Administración y permisos
  isAdmin: boolean;
  adminUser: string;
  loginAdmin: (password: string, username?: string) => Promise<boolean>;
  logoutAdmin: () => void;
  changeAdminPassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  isLoginModalOpen: boolean;
  loginModalReason: string;
  openLoginModal: (reason?: string) => void;
  closeLoginModal: () => void;

  // Acciones de venta
  addSale: (params: {
    productId: string;
    productName: string;
    category: CategoryId;
    quantity: number;
    date: string;
    unitBonus?: number;
    notes?: string;
  }) => Promise<void>;
  quickAddSale: (category: CategoryId) => Promise<void>;
  quickSubtractSale: (category: CategoryId) => Promise<void>;
  updateSale: (sale: Sale) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;

  // Acciones de producto y bonus
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Acciones de configuración y calendario
  updateSettings: (newSettings: CampaignSettings) => Promise<void>;
  toggleCalendarDay: (dateStr: string, isWorkingDay: boolean) => Promise<void>;

  // Export / Import / Backup
  exportDataJSON: () => Promise<void>;
  importDataJSON: (jsonString: string) => Promise<boolean>;
  exportSalesCSV: (customSales?: Sale[] | unknown, customFilename?: string, options?: CSVExportOptions) => void;
  clearDemoData: () => Promise<void>;
  resetToDefaults: () => Promise<void>;

  // Feedback UI
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'milestone') => void;
}

const SalesTrackerContext = createContext<SalesTrackerContextType | null>(null);

const isMilestoneLevelEnabled = (milestone: 80 | 100 | 120, currentSettings?: CampaignSettings): boolean => {
  return currentSettings?.milestoneNotifications?.[milestone]?.enabled ?? true;
};

// Helper puro para obtener el escalón de hito alcanzado (80, 100, 120)
const getRawMilestoneFromProgress = (progress: number, totalTarget: number): 80 | 100 | 120 | null => {
  if (totalTarget <= 0) return null;
  if (progress >= 120) return 120;
  if (progress >= 100) return 100;
  if (progress >= 80) return 80;
  return null;
};

const getEnabledMilestoneFromProgress = (
  progress: number,
  totalTarget: number,
  currentSettings?: CampaignSettings
): 80 | 100 | 120 | null => {
  if (totalTarget <= 0) return null;
  if (progress >= 120 && isMilestoneLevelEnabled(120, currentSettings)) return 120;
  if (progress >= 100 && isMilestoneLevelEnabled(100, currentSettings)) return 100;
  if (progress >= 80 && isMilestoneLevelEnabled(80, currentSettings)) return 80;
  return null;
};

const formatMilestoneMessage = (
  milestone: 80 | 100 | 120,
  progress: number,
  totalSales: number,
  totalTarget: number,
  currentSettings?: CampaignSettings
) => {
  const customMsg =
    currentSettings?.milestoneNotifications?.[milestone]?.customMessage?.trim() ||
    DEFAULT_MILESTONE_NOTIFICATIONS[milestone].customMessage;
  return `${customMsg} (${progress}% • ${totalSales}/${totalTarget} uds)`;
};

export function SalesTrackerProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<CampaignSettings>(getDefaultSettings());
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'milestone' } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMilestoneRef = useRef<80 | 100 | 120 | null | undefined>(undefined);

  // Estado de administración
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string>('Administrador');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalReason, setLoginModalReason] = useState<string>('');

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'milestone' = 'success') => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setToast({ message, type });
      const duration = type === 'milestone' ? 5500 : 3500;
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, duration);
    },
    []
  );

  // Control de modales y autenticación admin
  const openLoginModal = useCallback((reason?: string) => {
    setLoginModalReason(reason || 'Inicia sesión como administrador para modificar ventas y configuraciones');
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    setLoginModalReason('');
  }, []);

  const loginAdmin = useCallback(
    async (password: string, username = 'Administrador'): Promise<boolean> => {
      const isValid = verifyAdminPassword(password.trim());
      if (isValid) {
        setIsAdmin(true);
        setAdminUser(username);
        saveAdminSession(true, username);
        setIsLoginModalOpen(false);
        setLoginModalReason('');
        showToast(`Sesión de administrador activa (${username})`, 'success');
        return true;
      } else {
        showToast('Contraseña de administrador incorrecta', 'error');
        return false;
      }
    },
    [showToast]
  );

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    setAdminUser('Invitado');
    saveAdminSession(false);
    showToast('Sesión cerrada. Modo consulta (sólo lectura) activo', 'info');
  }, [showToast]);

  const changeAdminPassword = useCallback(
    async (currentPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
      if (!verifyAdminPassword(currentPass.trim())) {
        return { success: false, error: 'La contraseña actual no es correcta' };
      }
      if (!newPass || newPass.trim().length < 3) {
        return { success: false, error: 'La nueva contraseña debe tener al menos 3 caracteres' };
      }
      setStoredAdminPassword(newPass.trim());
      showToast('Contraseña de administrador actualizada con éxito', 'success');
      return { success: true };
    },
    [showToast]
  );

  // Helper para verificar permiso y abrir login si no es admin
  const checkAdminPermission = useCallback(
    (actionDescription: string): boolean => {
      if (!isAdmin) {
        showToast(`Acceso restringido: Se requiere rol de administrador para ${actionDescription}`, 'error');
        openLoginModal(`Se requieren permisos de Administrador para ${actionDescription}. Inicia sesión para continuar.`);
        return false;
      }
      return true;
    },
    [isAdmin, openLoginModal, showToast]
  );

  // Carga inicial
  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);

        // Cargar sesión de administrador si existe en localStorage
        const adminSession = getAdminSession();
        setIsAdmin(adminSession.isAuthenticated);
        if (adminSession.username) {
          setAdminUser(adminSession.username);
        }

        const [loadedSettings, loadedProducts, loadedSales] = await Promise.all([
          repository.getSettings(),
          repository.getProducts(),
          repository.getSales(),
        ]);
        setSettings(loadedSettings);
        setProducts(loadedProducts);
        setSales(loadedSales);

        const initialStats = calculateDashboardStats(loadedSales, loadedSettings, loadedProducts, new Date());
        const initialRawMilestone = getRawMilestoneFromProgress(initialStats.overallProgress, initialStats.totalTarget);
        prevMilestoneRef.current = initialRawMilestone;
        const initialEnabledMilestone = getEnabledMilestoneFromProgress(
          initialStats.overallProgress,
          initialStats.totalTarget,
          loadedSettings
        );
        if (initialEnabledMilestone !== null) {
          showToast(
            formatMilestoneMessage(
              initialEnabledMilestone,
              initialStats.overallProgress,
              initialStats.totalSales,
              initialStats.totalTarget,
              loadedSettings
            ),
            'milestone'
          );
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        showToast('Error al cargar datos locales', 'error');
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [showToast]);

  // Recálculo dinámico de estadísticas y proyecciones
  const stats = useMemo(() => {
    return calculateDashboardStats(sales, settings, products, new Date());
  }, [sales, settings, products]);

  // Determinar hito mensual alcanzado y habilitado (80%, 100%, 120%)
  const activeMilestone: 80 | 100 | 120 | null = useMemo(() => {
    return getEnabledMilestoneFromProgress(stats.overallProgress, stats.totalTarget, settings);
  }, [stats.overallProgress, stats.totalTarget, settings]);

  const triggerMilestoneToast = useCallback(
    (milestone: 80 | 100 | 120) => {
      if (!isMilestoneLevelEnabled(milestone, settings)) {
        showToast(`Las alertas visuales para el hito del ${milestone}% están desactivadas en Configuración`, 'info');
        return;
      }
      showToast(
        formatMilestoneMessage(milestone, stats.overallProgress, stats.totalSales, stats.totalTarget, settings),
        'milestone'
      );
    },
    [showToast, stats.overallProgress, stats.totalSales, stats.totalTarget, settings]
  );

  const hasDemoData = useMemo(() => {
    return sales.some((s) => s.isDemo);
  }, [sales]);

  // Registrar venta completa (requiere admin)
  const addSale = useCallback(
    async (params: {
      productId: string;
      productName: string;
      category: CategoryId;
      quantity: number;
      date: string;
      unitBonus?: number;
      notes?: string;
    }) => {
      if (!checkAdminPermission('registrar ventas')) return;

      const product = products.find((p) => p.id === params.productId);
      const unitBonus = params.unitBonus !== undefined ? params.unitBonus : (product?.bonus || 0);
      const totalBonus = unitBonus * params.quantity;

      const newSale: Sale = {
        id: 'sale-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        date: params.date,
        productId: params.productId || 'custom',
        productName: params.productName,
        category: params.category,
        quantity: params.quantity,
        unitBonus,
        totalBonus,
        notes: params.notes,
        createdAt: new Date().toISOString(),
      };

      const updatedSales = [newSale, ...sales];
      await repository.addSale(newSale);
      setSales(updatedSales);

      const nextStats = calculateDashboardStats(updatedSales, settings, products, new Date());
      const nextRawMilestone = getRawMilestoneFromProgress(nextStats.overallProgress, nextStats.totalTarget);
      const prevMilestoneVal = prevMilestoneRef.current ?? 0;
      const nextMilestoneVal = nextRawMilestone ?? 0;
      prevMilestoneRef.current = nextRawMilestone;

      if (
        nextRawMilestone !== null &&
        nextMilestoneVal > prevMilestoneVal &&
        isMilestoneLevelEnabled(nextRawMilestone, settings)
      ) {
        showToast(
          formatMilestoneMessage(
            nextRawMilestone,
            nextStats.overallProgress,
            nextStats.totalSales,
            nextStats.totalTarget,
            settings
          ),
          'milestone'
        );
      } else {
        showToast(`Venta registrada correctamente (+${newSale.quantity} ${newSale.productName})`);
      }
    },
    [products, sales, settings, showToast, checkAdminPermission]
  );

  // Registro rápido por gama (requiere admin)
  const quickAddSale = useCallback(
    async (category: CategoryId) => {
      if (!checkAdminPermission('registrar ventas rápidas')) return;

      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      const categoryProduct = products.find((p) => p.category === category && p.isActive !== false) || {
        id: 'generic-' + category.toLowerCase(),
        name: `Dispositivo ${category}`,
        category,
        bonus: 0,
      };

      await addSale({
        productId: categoryProduct.id,
        productName: categoryProduct.name,
        category,
        quantity: 1,
        date: dateStr,
        unitBonus: categoryProduct.bonus,
      });
    },
    [products, addSale, checkAdminPermission]
  );

  // Resta rápida por gama (requiere admin)
  const quickSubtractSale = useCallback(
    async (category: CategoryId) => {
      if (!checkAdminPermission('restar ventas')) return;

      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const monthPrefix = `${settings.year}-${String(settings.month).padStart(2, '0')}`;

      // Buscar ventas de esta gama del mes actual con cantidad positiva
      const candidateSales = sales.filter(
        (s) => s.category === category && s.date.startsWith(monthPrefix) && s.quantity > 0
      );

      if (candidateSales.length === 0) {
        showToast(`No hay ventas registradas en ${category} para restar`, 'error');
        return;
      }

      // Priorizar la venta de hoy más reciente; si no hay hoy, la más reciente del mes
      const todaySale = candidateSales.find((s) => s.date === todayStr);
      const targetSale = todaySale || candidateSales[0];

      if (targetSale.quantity > 1) {
        // Reducir cantidad en 1
        const updatedSale: Sale = {
          ...targetSale,
          quantity: targetSale.quantity - 1,
          totalBonus: targetSale.unitBonus * (targetSale.quantity - 1),
        };
        await repository.updateSale(updatedSale);
        setSales((prev) => prev.map((s) => (s.id === targetSale.id ? updatedSale : s)));
        showToast(`Restada 1 unidad en ${targetSale.productName} (quedan ${updatedSale.quantity})`, 'info');
      } else {
        // Eliminar la venta de 1 unidad
        await repository.deleteSale(targetSale.id);
        setSales((prev) => prev.filter((s) => s.id !== targetSale.id));
        showToast(`Venta eliminada (-1 ${targetSale.productName})`, 'info');
      }
    },
    [sales, settings.year, settings.month, showToast, checkAdminPermission]
  );

  const updateSale = useCallback(
    async (updated: Sale) => {
      if (!checkAdminPermission('modificar ventas del historial')) return;

      const recalculated: Sale = {
        ...updated,
        totalBonus: updated.quantity * updated.unitBonus,
      };
      await repository.updateSale(recalculated);
      setSales((prev) => prev.map((s) => (s.id === recalculated.id ? recalculated : s)));
      showToast('Venta actualizada');
    },
    [showToast, checkAdminPermission]
  );

  const deleteSale = useCallback(
    async (id: string) => {
      if (!checkAdminPermission('eliminar ventas del historial')) return;

      await repository.deleteSale(id);
      setSales((prev) => prev.filter((s) => s.id !== id));
      showToast('Venta eliminada del historial', 'info');
    },
    [showToast, checkAdminPermission]
  );

  // Gestión de productos (requiere admin)
  const addProduct = useCallback(
    async (productData: Omit<Product, 'id'>) => {
      if (!checkAdminPermission('añadir productos al catálogo')) return;

      const newProduct: Product = {
        ...productData,
        id: 'prod-' + Date.now(),
        isActive: true,
      };
      const updated = [...products, newProduct];
      await repository.saveProducts(updated);
      setProducts(updated);
      showToast('Producto añadido al catálogo');
    },
    [products, showToast, checkAdminPermission]
  );

  const updateProduct = useCallback(
    async (updated: Product) => {
      if (!checkAdminPermission('modificar productos del catálogo')) return;

      const list = products.map((p) => (p.id === updated.id ? updated : p));
      await repository.saveProducts(list);
      setProducts(list);
      showToast('Producto actualizado');
    },
    [products, showToast, checkAdminPermission]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      if (!checkAdminPermission('eliminar productos del catálogo')) return;

      const list = products.filter((p) => p.id !== id);
      await repository.saveProducts(list);
      setProducts(list);
      showToast('Producto eliminado');
    },
    [products, showToast, checkAdminPermission]
  );

  // Configuración (requiere admin)
  const updateSettings = useCallback(
    async (newSettings: CampaignSettings) => {
      if (!checkAdminPermission('guardar la configuración de tienda y objetivos')) return;

      await repository.saveSettings(newSettings);
      setSettings(newSettings);
      showToast('Configuración guardada correctamente');
    },
    [showToast, checkAdminPermission]
  );

  const toggleCalendarDay = useCallback(
    async (dateStr: string, isWorkingDay: boolean) => {
      if (!checkAdminPermission('modificar el calendario laboral')) return;

      const updatedOverrides = {
        ...settings.workDaysConfig.customDayOverrides,
        [dateStr]: isWorkingDay,
      };
      const updatedSettings: CampaignSettings = {
        ...settings,
        workDaysConfig: {
          ...settings.workDaysConfig,
          customDayOverrides: updatedOverrides,
        },
      };
      await repository.saveSettings(updatedSettings);
      setSettings(updatedSettings);
    },
    [settings, checkAdminPermission]
  );

  // Exportar / Importar / Reset
  const exportDataJSON = useCallback(async () => {
    try {
      const payload = await repository.exportData();
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `team-sales-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Copia de seguridad exportada con éxito');
    } catch (e) {
      console.error(e);
      showToast('Error al exportar datos', 'error');
    }
  }, [showToast]);

  const importDataJSON = useCallback(
    async (jsonString: string): Promise<boolean> => {
      if (!checkAdminPermission('restaurar datos de respaldo')) return false;

      try {
        const payload = JSON.parse(jsonString);
        if (!payload.settings || !payload.sales) {
          throw new Error('Estructura de respaldo no válida');
        }
        await repository.importData(payload);
        setSettings(payload.settings);
        setProducts(payload.products || []);
        setSales(payload.sales || []);
        showToast('Datos restaurados correctamente');
        return true;
      } catch (e) {
        console.error(e);
        showToast('Error al importar archivo de respaldo', 'error');
        return false;
      }
    },
    [showToast, checkAdminPermission]
  );

  const exportSalesCSV = useCallback(
    (customSales?: Sale[] | unknown, customFilename?: string, options?: CSVExportOptions) => {
      const targetSales = Array.isArray(customSales) ? (customSales as Sale[]) : sales;
      if (targetSales.length === 0) {
        showToast('No hay registros de ventas para exportar a CSV', 'info');
        return;
      }

      const monthPadded = String(settings.month).padStart(2, '0');
      const defaultFilename = `ventas-${settings.storeCode || 'team'}-${settings.year}-${monthPadded}.csv`;
      const filename = typeof customFilename === 'string' && customFilename.trim() ? customFilename : defaultFilename;

      exportSalesToCSV(targetSales, filename, {
        ...options,
        settings: {
          storeName: settings.storeName,
          storeCode: settings.storeCode,
          campaignName: settings.campaignName,
          month: settings.month,
          year: settings.year,
        },
      });
      showToast(`Exportados ${targetSales.length} registros a CSV (${filename})`, 'success');
    },
    [sales, settings, showToast]
  );

  const clearDemoData = useCallback(async () => {
    if (!checkAdminPermission('eliminar datos de demostración')) return;

    await repository.clearDemoData();
    const remaining = sales.filter((s) => !s.isDemo);
    setSales(remaining);
    showToast('Datos de demostración eliminados', 'info');
  }, [sales, showToast, checkAdminPermission]);

  const resetToDefaults = useCallback(async () => {
    if (!checkAdminPermission('restablecer los valores de fábrica')) return;

    await repository.clearAllData();
    const defaults = getDefaultSettings();
    setSettings(defaults);
    setProducts(await repository.getProducts());
    setSales(await repository.getSales());
    showToast('Aplicación restablecida con valores de fábrica', 'info');
  }, [showToast, checkAdminPermission]);

  return (
    <SalesTrackerContext.Provider
      value={{
        sales,
        products,
        settings,
        stats,
        loading,
        toast,
        hasDemoData,
        activeMilestone,
        triggerMilestoneToast,
        dismissToast,
        isAdmin,
        adminUser,
        loginAdmin,
        logoutAdmin,
        changeAdminPassword,
        isLoginModalOpen,
        loginModalReason,
        openLoginModal,
        closeLoginModal,
        addSale,
        quickAddSale,
        quickSubtractSale,
        updateSale,
        deleteSale,
        addProduct,
        updateProduct,
        deleteProduct,
        updateSettings,
        toggleCalendarDay,
        exportDataJSON,
        importDataJSON,
        exportSalesCSV,
        clearDemoData,
        resetToDefaults,
        showToast,
      }}
    >
      {children}
    </SalesTrackerContext.Provider>
  );
}

export function useSalesTracker() {
  const context = useContext(SalesTrackerContext);
  if (!context) {
    throw new Error('useSalesTracker debe utilizarse dentro de un SalesTrackerProvider');
  }
  return context;
}
