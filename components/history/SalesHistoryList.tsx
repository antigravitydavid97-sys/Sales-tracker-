'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Filter,
  Trash2,
  Edit2,
  Plus,
  FileSpreadsheet,
  AlertTriangle,
  Calendar,
  Layers,
  Package,
  X,
  Check,
  Lock,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { CategoryId, Sale } from '@/types';
import { useSalesTracker } from '@/context/SalesTrackerContext';

export function SalesHistoryList() {
  const { sales, products, deleteSale, updateSale, exportSalesCSV, isAdmin, openLoginModal } = useSalesTracker();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProductId, setSelectedProductId] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Estados para modal de edición
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editNotes, setEditNotes] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editCategory, setEditCategory] = useState<CategoryId>('HIGH');

  // Estados para confirmación de eliminación
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Registro seleccionado para eliminar
  const saleToDelete = useMemo(() => {
    if (!deletingSaleId) return null;
    return sales.find((s) => s.id === deletingSaleId) || null;
  }, [sales, deletingSaleId]);

  // Manejo de la tecla Escape para cerrar modales
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deletingSaleId && !isDeleting) {
          setDeletingSaleId(null);
        } else if (editingSale) {
          setEditingSale(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deletingSaleId, editingSale, isDeleting]);

  // Filtrado reactivo
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Búsqueda por texto (nombre de producto o notas)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProduct = (sale.productName || '').toLowerCase().includes(q);
        const matchesNotes = (sale.notes || '').toLowerCase().includes(q);
        const matchesCat = (sale.category || '').toLowerCase().includes(q);
        if (!matchesProduct && !matchesNotes && !matchesCat) {
          return false;
        }
      }

      // Filtro por Gama
      if (selectedCategory !== 'ALL' && sale.category !== selectedCategory) {
        return false;
      }

      // Filtro por Producto
      if (selectedProductId !== 'ALL' && sale.productId !== selectedProductId) {
        return false;
      }

      // Filtro por Fecha
      if (selectedDate && sale.date !== selectedDate) {
        return false;
      }

      return true;
    });
  }, [sales, searchQuery, selectedCategory, selectedProductId, selectedDate]);

  // Totales de las ventas filtradas
  const totalFilteredUnits = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.quantity, 0);
  }, [filteredSales]);

  const totalFilteredBonus = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.totalBonus, 0);
  }, [filteredSales]);

  // Manejadores de edición
  const openEditModal = (sale: Sale) => {
    if (!isAdmin) {
      openLoginModal('modificar ventas del historial');
      return;
    }
    setEditingSale(sale);
    setEditQuantity(sale.quantity);
    setEditNotes(sale.notes || '');
    setEditDate(sale.date);
    setEditCategory(sale.category);
  };

  const handleSaveEdit = async () => {
    if (!editingSale) return;
    await updateSale({
      ...editingSale,
      quantity: Number(editQuantity),
      notes: editNotes,
      date: editDate,
      category: editCategory,
    });
    setEditingSale(null);
  };

  // Manejadores de eliminación
  const requestDelete = (saleId: string) => {
    if (!isAdmin) {
      openLoginModal('eliminar ventas del historial');
      return;
    }
    setDeletingSaleId(saleId);
  };

  const confirmDelete = async () => {
    if (!deletingSaleId || isDeleting) return;
    try {
      setIsDeleting(true);
      await deleteSale(deletingSaleId);
      setDeletingSaleId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedProductId('ALL');
    setSelectedDate('');
  };

  const hasActiveFilters =
    Boolean(searchQuery) || selectedCategory !== 'ALL' || selectedProductId !== 'ALL' || Boolean(selectedDate);

  return (
    <div className="space-y-5">
      {/* Cabecera y botón de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Historial de Ventas</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Registro cronológico detallado con desglose de bonus y gamas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportSalesCSV}
            id="history-export-csv-btn"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <Link
            href="/ventas"
            id="history-add-sale-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Venta</span>
          </Link>
        </div>
      </div>

      {/* Admin Notice Banner */}
      {!isAdmin ? (
        <div
          id="history-read-only-banner"
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Modo Consulta Activo:</strong> Puedes revisar y filtrar ventas. Para editar o eliminar registros, inicia sesión como administrador.
            </span>
          </div>
          <button
            type="button"
            onClick={() => openLoginModal('modificar o eliminar ventas')}
            id="history-login-admin-btn"
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
              Sesión de administrador activa. Tienes permisos para modificar y eliminar registros del historial.
            </span>
          </div>
          <span className="text-[11px] font-bold bg-white text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
            Desbloqueado
          </span>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Búsqueda por texto */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-600" />
            <input
              type="text"
              id="history-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar producto, notas..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white placeholder:text-slate-600"
            />
          </div>

          {/* Filtro por Gama */}
          <div>
            <select
              id="history-filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            >
              <option value="ALL">Todas las Gamas</option>
              <option value="HIGH">Gama HIGH</option>
              <option value="MID">Gama MID</option>
              <option value="ENTRY">Gama ENTRY</option>
            </select>
          </div>

          {/* Filtro por Producto */}
          <div>
            <select
              id="history-filter-product"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            >
              <option value="ALL">Todos los Productos</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Fecha */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              id="history-filter-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg shrink-0 transition-colors"
                title="Limpiar filtros"
                aria-label="Limpiar filtros"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Resumen de resultados filtrados */}
        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
          <span>
            Mostrando <strong>{filteredSales.length}</strong> {filteredSales.length === 1 ? 'registro' : 'registros'}
          </span>
          <div className="flex items-center gap-3">
            <span>Total uds: <strong className="text-slate-900">{totalFilteredUnits}</strong></span>
            <span>•</span>
            <span>Total Bonus: <strong className="text-emerald-600">+{totalFilteredBonus.toFixed(2)} €</strong></span>
          </div>
        </div>
      </div>

      {/* Lista de Ventas */}
      {filteredSales.length === 0 ? (
        <div
          id="history-empty-state"
          className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center space-y-3"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No hay ventas registradas</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No se encontraron ventas que coincidan con los filtros seleccionados.'
              : 'Aún no has registrado ninguna venta en este periodo.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Restablecer filtros
            </button>
          ) : (
            <Link
              href="/ventas"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar mi primera venta</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Vista Tabla para Escritorio (Desktop) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs" id="history-desktop-table">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Gama</th>
                  <th className="py-3 px-4 text-center">Cantidad</th>
                  <th className="py-3 px-4 text-right">Bonus Total</th>
                  <th className="py-3 px-4">Notas</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {sale.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {sale.productName}
                      {sale.isDemo && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          DEMO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          sale.category === 'HIGH'
                            ? 'bg-blue-100 text-blue-700'
                            : sale.category === 'MID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {sale.category}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-center font-bold ${sale.quantity < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {sale.quantity < 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <span>{sale.quantity}</span>
                          <span className="text-[9px] px-1 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                            RESTA
                          </span>
                        </span>
                      ) : (
                        sale.quantity
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                      sale.totalBonus < 0 ? 'text-rose-600' : sale.totalBonus > 0 ? 'text-emerald-600' : 'text-slate-600'
                    }`}>
                      {sale.totalBonus > 0 ? `+${sale.totalBonus.toFixed(2)} €` : `${sale.totalBonus.toFixed(2)} €`}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {sale.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(sale)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar venta"
                          aria-label={`Editar venta ${sale.productName}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => requestDelete(sale.id)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar venta"
                          aria-label={`Eliminar venta ${sale.productName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista Tarjetas para Móvil (Touch-friendly Cards) */}
          <div className="md:hidden space-y-2.5" id="history-mobile-cards">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sale.category === 'HIGH'
                            ? 'bg-blue-100 text-blue-700'
                            : sale.category === 'MID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {sale.category}
                      </span>
                      <span className="text-[11px] text-slate-600">{sale.date}</span>
                      {sale.isDemo && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                          DEMO
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{sale.productName}</h4>
                  </div>

                  <div className="text-right">
                    <span className={`text-base font-extrabold block ${sale.quantity < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {sale.quantity} {Math.abs(sale.quantity) === 1 ? 'ud' : 'uds'}
                    </span>
                    <span className={`text-xs font-bold ${
                      sale.totalBonus < 0 ? 'text-rose-600' : sale.totalBonus > 0 ? 'text-emerald-600' : 'text-slate-600'
                    }`}>
                      {sale.totalBonus > 0 ? `+${sale.totalBonus.toFixed(2)} €` : `${sale.totalBonus.toFixed(2)} €`}
                    </span>
                  </div>
                </div>

                {sale.notes && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                    {sale.notes}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => openEditModal(sale)}
                    className="flex items-center gap-1 px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => requestDelete(sale.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de Edición de Venta */}
      {editingSale && (
        <div
          id="edit-sale-modal"
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Editar Venta
              </h3>
              <button
                onClick={() => setEditingSale(null)}
                className="p-1 text-slate-600 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Producto</label>
                <p className="font-bold text-slate-900 text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {editingSale.productName}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gama</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['HIGH', 'MID', 'ENTRY'] as CategoryId[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditCategory(cat)}
                      className={`py-1.5 px-2 rounded-lg font-bold text-xs border ${
                        editCategory === cat
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cantidad (positiva para venta, negativa para devolución/resta)
                </label>
                <input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ticket / Detalles"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSale(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación para evitar pérdida accidental de datos */}
      {deletingSaleId && saleToDelete && (
        <div
          id="delete-confirm-modal"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isDeleting && setDeletingSaleId(null)}
        >
          <div
            id="delete-confirm-modal-box"
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    ¿Eliminar registro de venta?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Confirmación de seguridad para evitar pérdida accidental
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isDeleting && setDeletingSaleId(null)}
                disabled={isDeleting}
                id="close-delete-modal-btn"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors disabled:opacity-40"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido con detalle del registro a eliminar */}
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          saleToDelete.category === 'HIGH'
                            ? 'bg-blue-100 text-blue-700'
                            : saleToDelete.category === 'MID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {saleToDelete.category}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {saleToDelete.date}
                      </span>
                      {saleToDelete.isDemo && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                          DEMO
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {saleToDelete.productName}
                    </h4>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-extrabold block ${
                        saleToDelete.quantity < 0 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {saleToDelete.quantity > 0
                        ? `+${saleToDelete.quantity} ${saleToDelete.quantity === 1 ? 'ud' : 'uds'}`
                        : `${saleToDelete.quantity} uds (Resta)`}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        saleToDelete.totalBonus < 0
                          ? 'text-rose-600'
                          : saleToDelete.totalBonus > 0
                          ? 'text-emerald-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {saleToDelete.totalBonus > 0
                        ? `+${saleToDelete.totalBonus.toFixed(2)} €`
                        : `${saleToDelete.totalBonus.toFixed(2)} €`}
                    </span>
                  </div>
                </div>

                {saleToDelete.notes && (
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60 italic">
                    &ldquo;{saleToDelete.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Advertencia de impacto */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Esta acción es <strong>irreversible</strong>. Las unidades y el bonus asociado serán descontados de los totales mensuales y del cálculo del tramo alcanzado.
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-2.5 p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setDeletingSaleId(null)}
                disabled={isDeleting}
                id="cancel-delete-sale-btn"
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-2xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                id="confirm-delete-sale-btn"
                className="px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.99] rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Registro</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
