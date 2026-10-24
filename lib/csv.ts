import { CampaignSettings, Sale } from '@/types';

export interface CSVExportOptions {
  delimiter?: ',' | ';';
  includeSummary?: boolean;
  settings?: Pick<CampaignSettings, 'storeName' | 'storeCode' | 'campaignName' | 'month' | 'year'>;
}

/**
 * Escapa un valor de texto para que sea seguro dentro de una celda CSV.
 */
function escapeCSVValue(val: string | number | undefined | null, delimiter: string = ','): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes('"') || str.includes(delimiter) || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Genera el contenido estructurado en formato CSV a partir de una lista de ventas.
 */
export function generateSalesCSVContent(sales: Sale[], options: CSVExportOptions = {}): string {
  const delimiter = options.delimiter || ',';
  const includeSummary = options.includeSummary ?? false;
  const storeLabel = options.settings
    ? `${options.settings.storeName} (${options.settings.storeCode})`
    : 'TE@M Store';
  const campaignLabel = options.settings?.campaignName || 'Campaña Mensual';

  const headers = [
    'ID',
    'Fecha',
    'Tienda',
    'Campaña',
    'Producto',
    'Gama',
    'Cantidad',
    'Bonus Unitario (€)',
    'Total Bonus (€)',
    'Tipo',
    'Notas',
  ];

  // Ordenar cronológicamente (más recientes primero) para mantener estructura consistente
  const sortedSales = [...sales].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  const rows = sortedSales.map((sale) => [
    escapeCSVValue(sale.id, delimiter),
    escapeCSVValue(sale.date, delimiter),
    escapeCSVValue(storeLabel, delimiter),
    escapeCSVValue(campaignLabel, delimiter),
    escapeCSVValue(sale.productName || 'Producto', delimiter),
    escapeCSVValue(sale.category, delimiter),
    String(sale.quantity),
    sale.unitBonus.toFixed(2),
    sale.totalBonus.toFixed(2),
    escapeCSVValue(sale.isDemo ? 'DEMO' : sale.quantity < 0 ? 'RESTA' : 'VENTA', delimiter),
    escapeCSVValue(sale.notes || '', delimiter),
  ]);

  const lines = [headers.join(delimiter), ...rows.map((row) => row.join(delimiter))];

  if (includeSummary && sortedSales.length > 0) {
    const totalUnits = sortedSales.reduce((acc, s) => acc + s.quantity, 0);
    const totalBonus = sortedSales.reduce((acc, s) => acc + s.totalBonus, 0);
    const highUnits = sortedSales
      .filter((s) => s.category === 'HIGH')
      .reduce((acc, s) => acc + s.quantity, 0);
    const midUnits = sortedSales
      .filter((s) => s.category === 'MID')
      .reduce((acc, s) => acc + s.quantity, 0);
    const entryUnits = sortedSales
      .filter((s) => s.category === 'ENTRY')
      .reduce((acc, s) => acc + s.quantity, 0);

    lines.push('');
    lines.push(
      [
        escapeCSVValue('TOTALES', delimiter),
        escapeCSVValue(`${sortedSales.length} registros`, delimiter),
        escapeCSVValue(storeLabel, delimiter),
        escapeCSVValue(campaignLabel, delimiter),
        escapeCSVValue(`HIGH: ${highUnits} | MID: ${midUnits} | ENTRY: ${entryUnits}`, delimiter),
        escapeCSVValue('TODAS', delimiter),
        String(totalUnits),
        escapeCSVValue('-', delimiter),
        totalBonus.toFixed(2),
        escapeCSVValue('RESUMEN', delimiter),
        escapeCSVValue('', delimiter),
      ].join(delimiter)
    );
  }

  return lines.join('\r\n');
}

/**
 * Convierte un array de ventas a formato CSV estructurado y descarga el archivo en el navegador.
 */
export function exportSalesToCSV(
  sales: Sale[],
  filename: string = 'ventas-team.csv',
  options: CSVExportOptions = {}
): void {
  const csvContent = generateSalesCSVContent(sales, options);

  // Añadir BOM UTF-8 (\uFEFF) para garantizar compatibilidad de acentos y símbolo € en Microsoft Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
