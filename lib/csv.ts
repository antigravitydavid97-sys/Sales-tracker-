import { Sale } from '@/types';

/**
 * Convierte un array de ventas a formato CSV y descarga el archivo.
 */
export function exportSalesToCSV(sales: Sale[], filename: string = 'ventas-team.csv') {
  const headers = ['ID', 'Fecha', 'Producto', 'Gama', 'Cantidad', 'Bonus Unitario (€)', 'Total Bonus (€)', 'Notas'];
  
  const rows = sales.map((sale) => [
    sale.id,
    sale.date,
    `"${(sale.productName || '').replace(/"/g, '""')}"`,
    sale.category,
    sale.quantity,
    sale.unitBonus.toFixed(2),
    sale.totalBonus.toFixed(2),
    `"${(sale.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
