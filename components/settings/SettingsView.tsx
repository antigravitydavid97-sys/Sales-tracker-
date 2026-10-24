'use client';

import React, { useState, useRef } from 'react';
import {
  Settings,
  Store,
  Calendar,
  Layers,
  Gift,
  Save,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
  Plus,
  AlertTriangle,
  ShieldCheck,
  Lock,
  BellRing,
  BellOff,
  Award,
  Trophy,
  Flame,
} from 'lucide-react';
import { CategoryId, CampaignSettings, MilestoneLevel, MilestoneNotificationsConfig } from '@/types';
import { DEFAULT_MILESTONE_NOTIFICATIONS } from '@/lib/storage';
import { useSalesTracker } from '@/context/SalesTrackerContext';

const WEEKDAYS = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' },
  { id: 0, label: 'Domingo' },
];

const MILESTONE_LEVELS_META: {
  level: MilestoneLevel;
  title: string;
  subtitle: string;
  badgeClass: string;
  accentBorderClass: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    level: 80,
    title: 'Hito del 80% del Objetivo',
    subtitle: 'Umbral mínimo de devengo de incentivos',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    accentBorderClass: 'border-blue-200 bg-blue-50/30',
    Icon: Award,
  },
  {
    level: 100,
    title: 'Hito del 100% del Objetivo',
    subtitle: 'Meta mensual de unidades cumplida',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accentBorderClass: 'border-emerald-200 bg-emerald-50/30',
    Icon: Trophy,
  },
  {
    level: 120,
    title: 'Hito del 120% del Objetivo',
    subtitle: 'Tramo de sobrecumplimiento y bonificación acelerada',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    accentBorderClass: 'border-amber-200 bg-amber-50/30',
    Icon: Flame,
  },
];

export function SettingsView() {
  const {
    settings,
    products,
    updateSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    exportDataJSON,
    importDataJSON,
    exportSalesCSV,
    clearDemoData,
    resetToDefaults,
    hasDemoData,
    showToast,
    isAdmin,
    openLoginModal,
  } = useSalesTracker();

  // Estado local para el formulario de configuración
  const [formData, setFormData] = useState<CampaignSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'gamas' | 'hitos' | 'bonus' | 'backup'>('general');

  // Estado para nuevo producto
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<CategoryId>('HIGH');
  const [newProductBonus, setNewProductBonus] = useState<number>(0);

  // Modales de confirmación
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar form si cambian settings externos durante render
  const [prevSettings, setPrevSettings] = useState(settings);
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setFormData(settings);
  }

  const currentMilestoneNotifications: MilestoneNotificationsConfig = {
    80: {
      ...DEFAULT_MILESTONE_NOTIFICATIONS[80],
      ...(formData.milestoneNotifications?.[80] || {}),
    },
    100: {
      ...DEFAULT_MILESTONE_NOTIFICATIONS[100],
      ...(formData.milestoneNotifications?.[100] || {}),
    },
    120: {
      ...DEFAULT_MILESTONE_NOTIFICATIONS[120],
      ...(formData.milestoneNotifications?.[120] || {}),
    },
  };

  const handleToggleMilestoneAlert = (level: MilestoneLevel, enabled: boolean) => {
    setFormData({
      ...formData,
      milestoneNotifications: {
        ...currentMilestoneNotifications,
        [level]: {
          ...currentMilestoneNotifications[level],
          enabled,
        },
      },
    });
  };

  const handleChangeMilestoneMessage = (level: MilestoneLevel, customMessage: string) => {
    setFormData({
      ...formData,
      milestoneNotifications: {
        ...currentMilestoneNotifications,
        [level]: {
          ...currentMilestoneNotifications[level],
          customMessage,
        },
      },
    });
  };

  const handleRestoreDefaultMilestoneMessages = () => {
    setFormData({
      ...formData,
      milestoneNotifications: {
        80: {
          enabled: currentMilestoneNotifications[80].enabled,
          customMessage: DEFAULT_MILESTONE_NOTIFICATIONS[80].customMessage,
        },
        100: {
          enabled: currentMilestoneNotifications[100].enabled,
          customMessage: DEFAULT_MILESTONE_NOTIFICATIONS[100].customMessage,
        },
        120: {
          enabled: currentMilestoneNotifications[120].enabled,
          customMessage: DEFAULT_MILESTONE_NOTIFICATIONS[120].customMessage,
        },
      },
    });
    showToast('Mensajes de hitos restaurados a los valores predeterminados', 'info');
  };

  // Manejar guardado de configuración general
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categories.HIGH.target < 0 || formData.categories.MID.target < 0 || formData.categories.ENTRY.target < 0) {
      showToast('Los objetivos no pueden ser negativos', 'error');
      return;
    }
    const normalizedSettings: CampaignSettings = {
      ...formData,
      milestoneNotifications: {
        80: {
          enabled: currentMilestoneNotifications[80].enabled,
          customMessage:
            currentMilestoneNotifications[80].customMessage.trim() ||
            DEFAULT_MILESTONE_NOTIFICATIONS[80].customMessage,
        },
        100: {
          enabled: currentMilestoneNotifications[100].enabled,
          customMessage:
            currentMilestoneNotifications[100].customMessage.trim() ||
            DEFAULT_MILESTONE_NOTIFICATIONS[100].customMessage,
        },
        120: {
          enabled: currentMilestoneNotifications[120].enabled,
          customMessage:
            currentMilestoneNotifications[120].customMessage.trim() ||
            DEFAULT_MILESTONE_NOTIFICATIONS[120].customMessage,
        },
      },
    };
    setFormData(normalizedSettings);
    await updateSettings(normalizedSettings);
  };

  // Toggle de días laborables por defecto
  const toggleDefaultWorkDay = (dayId: number) => {
    const current = formData.workDaysConfig.defaultWorkDays;
    const exists = current.includes(dayId);
    const updated = exists ? current.filter((d) => d !== dayId) : [...current, dayId];

    setFormData({
      ...formData,
      workDaysConfig: {
        ...formData.workDaysConfig,
        defaultWorkDays: updated,
      },
    });
  };

  // Añadir producto
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      showToast('Introduce un nombre para el producto', 'error');
      return;
    }
    await addProduct({
      name: newProductName.trim(),
      category: newProductCategory,
      bonus: Number(newProductBonus) || 0,
      isActive: true,
    });
    setNewProductName('');
    setNewProductBonus(0);
  };

  // Manejo de archivo JSON para importar
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        await importDataJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Subsección reutilizable: Notificaciones de Hitos (80%, 100%, 120%)
  const renderMilestoneNotificationsSection = () => (
    <div
      id="settings-milestone-notifications-section"
      className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-blue-600" />
            <span>Notificaciones de Hitos</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Habilita o deshabilita las alertas visuales para el 80%, 100% y 120% del objetivo mensual y personaliza el mensaje de éxito de cada nivel.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRestoreDefaultMilestoneMessages}
          id="reset-milestone-messages-btn"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar mensajes por defecto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {MILESTONE_LEVELS_META.map(({ level, title, subtitle, badgeClass, accentBorderClass, Icon }) => {
          const levelConfig = currentMilestoneNotifications[level];
          const isEnabled = levelConfig.enabled;

          return (
            <div
              key={level}
              id={`milestone-config-card-${level}`}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-4 text-xs ${
                isEnabled
                  ? accentBorderClass
                  : 'border-slate-200 bg-slate-50/70 opacity-85'
              }`}
            >
              <div className="space-y-3">
                {/* Cabecera del nivel y switch de activación */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isEnabled ? badgeClass : 'bg-slate-200/70 text-slate-500 border-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-xs">{title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isEnabled
                              ? badgeClass
                              : 'bg-slate-200 text-slate-600 border-slate-300'
                          }`}
                        >
                          {level}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Control de habilitar / deshabilitar alerta visual */}
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    {isEnabled ? (
                      <BellRing className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <BellOff className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <label
                        htmlFor={`milestone-toggle-${level}`}
                        className="font-bold text-slate-800 block cursor-pointer"
                      >
                        Alerta visual del {level}%
                      </label>
                      <span className="text-[10px] text-slate-500">
                        {isEnabled ? 'Notificación activa en Dashboard' : 'Notificación desactivada'}
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id={`milestone-toggle-${level}`}
                      checked={isEnabled}
                      onChange={(e) => handleToggleMilestoneAlert(level, e.target.checked)}
                      aria-label={`Habilitar alerta visual para el ${level}% del objetivo`}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Campo de mensaje de éxito personalizado */}
                <div>
                  <label
                    htmlFor={`milestone-message-${level}`}
                    className="block font-semibold text-slate-700 mb-1.5"
                  >
                    Mensaje de éxito para el {level}%
                  </label>
                  <textarea
                    id={`milestone-message-${level}`}
                    rows={3}
                    value={levelConfig.customMessage}
                    onChange={(e) => handleChangeMilestoneMessage(level, e.target.value)}
                    placeholder={DEFAULT_MILESTONE_NOTIFICATIONS[level].customMessage}
                    aria-label={`Mensaje de éxito para el ${level}%`}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>
              </div>

              {/* Pie de tarjeta: Vista previa rápida */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isEnabled ? 'Habilitado' : 'Deshabilitado'}
                </span>

                <button
                  type="button"
                  id={`milestone-preview-btn-${level}`}
                  onClick={() =>
                    showToast(
                      levelConfig.customMessage.trim() ||
                        DEFAULT_MILESTONE_NOTIFICATIONS[level].customMessage,
                      'milestone'
                    )
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <BellRing className="w-3 h-3" />
                  <span>Probar alerta</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Configuración del Sistema</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Personaliza objetivos, incentivos, notificaciones de hitos, calendario y catálogo de modelos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            id="reset-all-data-btn"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Todo</span>
          </button>
        </div>
      </div>

      {/* Admin Notice Banner */}
      {!isAdmin ? (
        <div
          id="settings-read-only-banner"
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Modo Consulta Activo:</strong> Se requiere iniciar sesión como administrador para guardar cambios de tienda, objetivos, modelos y copias de seguridad.
            </span>
          </div>
          <button
            type="button"
            onClick={() => openLoginModal('modificar la configuración')}
            id="settings-login-admin-btn"
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs transition-colors shrink-0 shadow-2xs cursor-pointer text-center"
          >
            Acceso Administrador
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Sesión de administrador activa. Tienes permisos para modificar y guardar todas las configuraciones.
            </span>
          </div>
          <span className="text-[11px] font-bold bg-white text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
            Desbloqueado
          </span>
        </div>
      )}

      {/* Tabs de Configuración */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          id="settings-tab-general"
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === 'general'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          General y Calendario
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gamas')}
          id="settings-tab-gamas"
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === 'gamas'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Objetivos de Gamas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hitos')}
          id="settings-tab-milestones"
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'hitos'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Notificaciones de Hitos</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bonus')}
          id="settings-tab-bonus"
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === 'bonus'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Bonus y Modelos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('backup')}
          id="settings-tab-backup"
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === 'backup'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Copias de Seguridad y Datos
        </button>
      </div>

      {/* TAB 1: GENERAL Y CALENDARIO */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Store className="w-4 h-4 text-blue-600" />
              <span>Datos Generales de la Campaña y Tienda</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre de la Tienda</label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Código de Tienda</label>
                <input
                  type="text"
                  value={formData.storeCode}
                  onChange={(e) => setFormData({ ...formData, storeCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Zona / Territorio</label>
                <input
                  type="text"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre de Campaña</label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mes de Cómputo (1-12)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Año</label>
                <input
                  type="number"
                  min="2020"
                  max="2035"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2026 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Días laborables por defecto de la semana */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Jornadas Laborables Habituales (Días por defecto)</span>
            </h2>
            <p className="text-xs text-slate-600">
              Marca los días de la semana en los que habitualmente trabajas. Los días no marcados se computan como libres/festivos automáticamente.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {WEEKDAYS.map((wd) => {
                const isSelected = formData.workDaysConfig.defaultWorkDays.includes(wd.id);
                return (
                  <button
                    key={wd.id}
                    type="button"
                    onClick={() => toggleDefaultWorkDay(wd.id)}
                    className={`p-3 rounded-xl text-xs font-bold border flex flex-col items-center justify-between gap-1 transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{wd.label}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isSelected ? 'Laborable' : 'Libre'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subsección Notificaciones de Hitos */}
          {renderMilestoneNotificationsSection()}

          <button
            type="submit"
            id="save-general-settings-btn"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración General</span>
          </button>
        </form>
      )}

      {/* TAB 2: OBJETIVOS E INCENTIVOS POR GAMA */}
      {activeTab === 'gamas' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Configuración de Objetivos e Incentivos por Gama</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(['HIGH', 'MID', 'ENTRY'] as CategoryId[]).map((catId) => {
                const cat = formData.categories[catId];
                return (
                  <div
                    key={catId}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="font-extrabold text-sm text-slate-900">{catId}</span>
                      <span className="text-[11px] font-medium text-slate-600">Gama {catId}</span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Objetivo de Unidades
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={cat.target}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categories: {
                              ...formData.categories,
                              [catId]: { ...cat, target: parseInt(e.target.value) || 0 },
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Incentivo Base (€ al 100%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={cat.baseIncentive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categories: {
                              ...formData.categories,
                              [catId]: { ...cat, baseIncentive: parseFloat(e.target.value) || 0 },
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Máximo % de Pago (Cap)
                      </label>
                      <input
                        type="number"
                        min="80"
                        max="200"
                        value={cat.maxPayoutPercentage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categories: {
                              ...formData.categories,
                              [catId]: { ...cat, maxPayoutPercentage: parseInt(e.target.value) || 140 },
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Umbral mínimo de incentivos */}
            <div className="pt-2">
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                Umbral mínimo de consecución para cobrar incentivo (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={formData.minimumIncentiveThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimumIncentiveThreshold: parseInt(e.target.value) || 80,
                  })
                }
                className="w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
              <span className="text-[11px] text-slate-600 block mt-1">
                Por debajo de este porcentaje, el incentivo calculado será 0 €.
              </span>
            </div>
          </div>

          {/* Subsección Notificaciones de Hitos */}
          {renderMilestoneNotificationsSection()}

          <button
            type="submit"
            id="save-gamas-settings-btn"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Objetivos y Notificaciones</span>
          </button>
        </form>
      )}

      {/* TAB 2.5: NOTIFICACIONES DE HITOS */}
      {activeTab === 'hitos' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {renderMilestoneNotificationsSection()}

          <button
            type="submit"
            id="save-milestone-settings-btn"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Notificaciones de Hitos</span>
          </button>
        </form>
      )}

      {/* TAB 3: BONUS POR PRODUCTO Y MODELOS */}
      {activeTab === 'bonus' && (
        <div className="space-y-6">
          {/* Formulario Añadir Producto */}
          <form
            onSubmit={handleAddProduct}
            className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-4"
          >
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Añadir Nuevo Producto / Modelo al Catálogo</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Modelo</label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Ej: HONOR Magic V3"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gama</label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value as CategoryId)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="HIGH">HIGH</option>
                  <option value="MID">MID</option>
                  <option value="ENTRY">ENTRY</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bonus (€/ud)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newProductBonus}
                  onChange={(e) => setNewProductBonus(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Producto</span>
            </button>
          </form>

          {/* Listado Editable de Productos */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>Catálogo Actual de Modelos y Bonus ({products.length})</span>
              </span>
            </h2>

            <div className="divide-y divide-slate-100">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        p.category === 'HIGH'
                          ? 'bg-blue-100 text-blue-800'
                          : p.category === 'MID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {p.category}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600 font-medium">Bonus:</span>
                      <input
                        type="number"
                        min="0"
                        value={p.bonus}
                        onChange={(e) =>
                          updateProduct({
                            ...p,
                            bonus: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-emerald-600"
                      />
                      <span className="text-slate-600 font-semibold">€</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteProduct(p.id)}
                      className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar producto"
                      aria-label={`Eliminar producto ${p.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COPIAS DE SEGURIDAD Y DATOS */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Exportar e Importar Datos</span>
            </h2>
            <p className="text-xs text-slate-600">
              Guarda copias de seguridad completas de tus ventas, configuración y bonus para transferirlas a otro dispositivo o archivarlas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Exportar JSON */}
              <button
                type="button"
                onClick={exportDataJSON}
                id="settings-export-json-btn"
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-2 text-center transition-colors"
              >
                <Download className="w-6 h-6 text-blue-600" />
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Exportar Backup Completo</span>
                  <span className="text-[11px] text-slate-600">Descarga un archivo .json</span>
                </div>
              </button>

              {/* Exportar CSV */}
              <button
                type="button"
                onClick={exportSalesCSV}
                id="settings-export-csv-btn"
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-2 text-center transition-colors"
              >
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Exportar Ventas a CSV</span>
                  <span className="text-[11px] text-slate-600">Compatible con Excel / Sheets</span>
                </div>
              </button>

              {/* Importar JSON */}
              <label
                className="p-4 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100/50 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
              >
                <Upload className="w-6 h-6 text-blue-600" />
                <div>
                  <span className="font-bold text-blue-900 text-xs block">Restaurar Copia de Seguridad</span>
                  <span className="text-[11px] text-blue-700">Seleccionar archivo .json</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json,application/json"
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Opciones de Limpieza y Restablecimiento */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Zona de Peligro / Mantenimiento de Datos</span>
            </h2>

            <div className="space-y-3">
              {hasDemoData && (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                  <div>
                    <h4 className="font-bold text-amber-900">Eliminar ventas de demostración</h4>
                    <p className="text-amber-700 text-[11px]">
                      Borra únicamente las ventas precargadas como ejemplo, conservando las ventas registradas por ti.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDemoModal(true)}
                    id="settings-clear-demo-btn"
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shrink-0"
                  >
                    Eliminar Demo
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                <div>
                  <h4 className="font-bold text-rose-900">Restablecer la aplicación de fábrica</h4>
                  <p className="text-rose-700 text-[11px]">
                    Borra todo el almacenamiento local (ventas, calendario, configuración) y restaura los valores iniciales.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  id="settings-reset-all-btn"
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shrink-0"
                >
                  Restablecer Todo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminar Demo */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">¿Eliminar datos demo?</h3>
            <p className="text-xs text-slate-600">
              Se eliminarán todas las ventas marcadas como demostración para que comiences con tu historial limpio.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await clearDemoData();
                  setShowDemoModal(false);
                }}
                className="py-2 px-3 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Restablecer Todo */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">¿Restablecer todo a fábrica?</h3>
              <p className="text-xs text-slate-600">
                Esta acción borrará todas las ventas, objetivos modificados y configuraciones personalizadas.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await resetToDefaults();
                  setShowResetModal(false);
                }}
                className="py-2.5 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Sí, restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
