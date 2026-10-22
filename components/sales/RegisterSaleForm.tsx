'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PlusCircle,
  MinusCircle,
  Calendar,
  Package,
  Layers,
  Hash,
  Gift,
  Check,
  AlertCircle,
  Zap,
  ArrowRight,
  Minus,
  Plus,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { CategoryId, Product } from '@/types';
import { useSalesTracker } from '@/context/SalesTrackerContext';

interface RegisterSaleFormProps {
  initialCategory?: CategoryId;
  onSuccess?: () => void;
}

export function RegisterSaleForm({ initialCategory, onSuccess }: RegisterSaleFormProps) {
  const router = useRouter();
  const { products, addSale, quickAddSale, quickSubtractSale, showToast, isAdmin, openLoginModal } = useSalesTracker();

  // Fecha por defecto hoy
  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [operationType, setOperationType] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [date, setDate] = useState<string>(todayStr());
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [category, setCategory] = useState<CategoryId>(initialCategory || 'HIGH');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar productos activos
  const activeProducts = products.filter((p) => p.isActive !== false);

  const defaultProduct = (initialCategory ? activeProducts.find((p) => p.category === initialCategory) : null) || activeProducts[0];
  const effectiveProductId = selectedProductId || defaultProduct?.id || '';
  const selectedProduct = activeProducts.find((p) => p.id === effectiveProductId);

  // Al seleccionar producto, sincronizar automáticamente su gama
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = activeProducts.find((p) => p.id === productId);
    if (prod) {
      setCategory(prod.category);
    }
  };

  const unitBonus = selectedProduct?.bonus || 0;
  const isSubtract = operationType === 'SUBTRACT';
  const effectiveQuantity = isSubtract ? -Math.abs(quantity) : Math.abs(quantity);
  const totalBonus = unitBonus * effectiveQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!date) {
      setError('Por favor, selecciona una fecha válida.');
      return;
    }
    if (!effectiveProductId) {
      setError('Por favor, selecciona un producto.');
      return;
    }
    if (quantity <= 0 || isNaN(quantity)) {
      setError('La cantidad debe ser mayor que 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addSale({
        productId: effectiveProductId,
        productName: selectedProduct?.name || 'Producto',
        category,
        quantity: effectiveQuantity,
        date,
        unitBonus,
        notes: notes.trim()
          ? isSubtract
            ? `[DEVOLUCIÓN/RESTA] ${notes.trim()}`
            : notes.trim()
          : isSubtract
          ? '[DEVOLUCIÓN/RESTA]'
          : undefined,
      });

      // Resetear campos para la siguiente venta manteniendo la fecha y tipo
      setQuantity(1);
      setNotes('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError('Error al guardar la venta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async (cat: CategoryId) => {
    await quickAddSale(cat);
  };

  const handleQuickSubtract = async (cat: CategoryId) => {
    await quickSubtractSale(cat);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Admin Notice Banner */}
      {!isAdmin ? (
        <div
          id="sales-read-only-banner"
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Modo Consulta Activo:</strong> Se requiere iniciar sesión como administrador para registrar o restar ventas.
            </span>
          </div>
          <button
            type="button"
            onClick={() => openLoginModal('registrar o restar ventas')}
            id="sales-login-admin-btn"
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
              Sesión de administrador activa. Modificaciones y restas habilitadas.
            </span>
          </div>
          <span className="text-[11px] font-bold bg-white text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
            Desbloqueado
          </span>
        </div>
      )}

      {/* Botones rápidos de registro en 1 toque (Sumar / Restar) */}
      <div
        id="quick-sale-buttons-bar"
        className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Ajuste Rápido de 1 Toque (Hoy)
            </h2>
          </div>
          <span className="text-[11px] text-slate-600 font-medium">Usa [-] para restar o [+] para sumar</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* HIGH */}
          <div className="flex flex-col rounded-xl bg-blue-50/70 border border-blue-200 p-2.5 text-center">
            <span className="text-[10px] font-bold text-blue-700 tracking-wider mb-2">GAMA HIGH</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickSubtract('HIGH')}
                id="quick-subtract-high"
                className="py-2 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-blue-100 font-extrabold text-sm flex items-center justify-center transition-all active:scale-95 shadow-2xs"
                title="Restar 1 HIGH"
                aria-label="Restar 1 unidad HIGH"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd('HIGH')}
                id="quick-btn-high"
                className="py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center transition-all active:scale-95 shadow-2xs"
                title="Añadir 1 HIGH"
                aria-label="Añadir 1 unidad HIGH"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MID */}
          <div className="flex flex-col rounded-xl bg-emerald-50/70 border border-emerald-200 p-2.5 text-center">
            <span className="text-[10px] font-bold text-emerald-700 tracking-wider mb-2">GAMA MID</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickSubtract('MID')}
                id="quick-subtract-mid"
                className="py-2 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-emerald-100 font-extrabold text-sm flex items-center justify-center transition-all active:scale-95 shadow-2xs"
                title="Restar 1 MID"
                aria-label="Restar 1 unidad MID"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd('MID')}
                id="quick-btn-mid"
                className="py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center transition-all active:scale-95 shadow-2xs"
                title="Añadir 1 MID"
                aria-label="Añadir 1 unidad MID"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ENTRY */}
          <div className="flex flex-col rounded-xl bg-purple-50/70 border border-purple-200 p-2.5 text-center">
            <span className="text-[10px] font-bold text-purple-700 tracking-wider mb-2">GAMA ENTRY</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickSubtract('ENTRY')}
                id="quick-subtract-entry"
                className="py-2 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-purple-100 font-extrabold text-sm flex items-center justify-center transition-all active:scale-95 shadow-2xs"
                title="Restar 1 ENTRY"
                aria-label="Restar 1 unidad ENTRY"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd('ENTRY')}
                id="quick-btn-entry"
                className="py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm flex items-center justify-center transition-all active:scale-95 shadow-2xs"
                title="Añadir 1 ENTRY"
                aria-label="Añadir 1 unidad ENTRY"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario Principal Detallado */}
      <form
        onSubmit={handleSubmit}
        id="register-sale-form"
        className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isSubtract ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {isSubtract ? <MinusCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {isSubtract ? 'Registrar Devolución / Restar Unidades' : 'Registrar Venta'}
              </h2>
              <p className="text-xs text-slate-600">
                {isSubtract
                  ? 'Descuenta unidades y bonus del cómputo mensual'
                  : 'Selecciona el modelo y la cantidad vendida'}
              </p>
            </div>
          </div>

          <Link
            href="/configuracion"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            + Añadir producto
          </Link>
        </div>

        {/* Selector de Tipo de Operación: Sumar Venta (+) vs Restar Devolución (-) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tipo de Operación
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setOperationType('ADD')}
              id="operation-type-add"
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                !isSubtract
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Venta Realizada (+)</span>
            </button>

            <button
              type="button"
              onClick={() => setOperationType('SUBTRACT')}
              id="operation-type-subtract"
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                isSubtract
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Devolución / Restar (-)</span>
            </button>
          </div>
        </div>

        {error && (
          <div
            id="sale-form-error"
            className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Fecha de la Venta / Devolución */}
        <div>
          <label htmlFor="sale-date" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>Fecha del Movimiento</span>
          </label>
          <input
            type="date"
            id="sale-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>

        {/* 2. Selector de Producto */}
        <div>
          <label htmlFor="sale-product" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-slate-600" />
            <span>Producto / Modelo</span>
          </label>
          <select
            id="sale-product"
            value={effectiveProductId}
            onChange={(e) => handleProductChange(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          >
            {activeProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — [{p.category}] {p.bonus > 0 ? `(${p.bonus}€ bonus)` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Gama (Autocompletada y editable) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>Gama Asignada</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['HIGH', 'MID', 'ENTRY'] as CategoryId[]).map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  id={`select-category-${cat.toLowerCase()}`}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? cat === 'HIGH'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs shadow-blue-500/30'
                        : cat === 'MID'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs shadow-emerald-500/30'
                        : 'bg-purple-600 border-purple-600 text-white shadow-xs shadow-purple-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Cantidad (Stepper táctil + input numérico) */}
        <div>
          <label htmlFor="sale-quantity" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-slate-600" />
            <span>{isSubtract ? 'Cantidad a Restar / Devolver' : 'Cantidad Vendida'}</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg transition-colors active:scale-95"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="number"
              id="sale-quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              required
              className="flex-1 text-center py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />

            <button
              type="button"
              onClick={() => setQuantity((prev) => prev + 1)}
              className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg transition-colors active:scale-95"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview de Bonus y Ganancia */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
          isSubtract
            ? 'bg-rose-50/70 border-rose-100 text-rose-800'
            : 'bg-emerald-50/60 border-emerald-100 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            <Gift className={`w-4 h-4 ${isSubtract ? 'text-rose-600' : 'text-emerald-600'}`} />
            <div>
              <span className="font-semibold block">
                {isSubtract ? 'Impacto en Bonus (Deducción):' : 'Bonus por esta venta:'}
              </span>
              <span className={`text-[11px] ${isSubtract ? 'text-rose-700' : 'text-emerald-700'}`}>
                {unitBonus} € × {effectiveQuantity} {Math.abs(quantity) === 1 ? 'unidad' : 'unidades'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-lg font-extrabold ${isSubtract ? 'text-rose-700' : 'text-emerald-700'}`}>
              {totalBonus >= 0 ? `+${totalBonus.toFixed(2)} €` : `${totalBonus.toFixed(2)} €`}
            </span>
          </div>
        </div>

        {/* 5. Notas opcionales */}
        <div>
          <label htmlFor="sale-notes" className="block text-xs font-semibold text-slate-700 mb-1.5">
            {isSubtract ? 'Motivo de la devolución o corrección (Opcional)' : 'Notas opcionales (Nº de ticket, IMEI o cliente)'}
          </label>
          <input
            type="text"
            id="sale-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isSubtract ? 'Ej: Cancelación de pedido / Error de tecleo' : 'Ej: Ticket #48291 / Color Negro'}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          id="submit-sale-btn"
          disabled={isSubmitting}
          className={`w-full py-3.5 px-4 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98 ${
            isSubtract
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
          }`}
        >
          {isSubtract ? <MinusCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <span>
            {isSubmitting
              ? 'Procesando...'
              : isSubtract
              ? `Registrar Devolución (-${quantity} ${quantity === 1 ? 'ud' : 'uds'})`
              : `Registrar Venta (+${quantity} ${quantity === 1 ? 'ud' : 'uds'})`}
          </span>
        </button>
      </form>
    </div>
  );
}

