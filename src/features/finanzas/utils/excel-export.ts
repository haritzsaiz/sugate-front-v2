import XLSX from 'xlsx-js-style'
import type { FinancialRecord } from '../data/schema'
import type { Billing } from '@/lib/types'
import { projectStatusLabels } from '../data/schema'

// Status labels for billing milestones
const hitoStatusLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  facturado: 'Facturado',
  cobrado: 'Cobrado',
}

// Color palette
const COLORS = {
  // Header colors
  headerBg: '1F4E79',
  headerFont: 'FFFFFF',
  // Alternating rows
  rowEven: 'FFFFFF',
  rowOdd: 'F2F2F2',
  // Totals row
  totalsBg: 'D9E2F3',
  totalsFont: '1F4E79',
  // Status colors for hitos
  pendiente: 'FFF3CD', // Amber/yellow
  facturado: 'CCE5FF', // Blue
  cobrado: 'D4EDDA', // Green
  // Financial colors
  cobradoFont: '28A745', // Green
  pdteCobro: '007BFF', // Blue
  pdteFactura: 'FFC107', // Amber
  sinAsignar: '6F42C1', // Purple
  excess: 'DC3545', // Red
  // Project status colors
  presupuesto: 'E9ECEF',
  presupuesto_abandonado: 'F8D7DA',
  planificacion: 'FFF3CD',
  en_ejecucion: 'CCE5FF',
  finalizado: 'D4EDDA',
  cancelado: 'F8D7DA',
}

// Cell style definitions
const headerStyle = {
  fill: { fgColor: { rgb: COLORS.headerBg } },
  font: { color: { rgb: COLORS.headerFont }, bold: true, sz: 11 },
  alignment: { horizontal: 'center' as const, vertical: 'center' as const },
  border: {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } },
  },
}

const totalsStyle = {
  fill: { fgColor: { rgb: COLORS.totalsBg } },
  font: { color: { rgb: COLORS.totalsFont }, bold: true, sz: 11 },
  alignment: { horizontal: 'left' as const, vertical: 'center' as const },
  border: {
    top: { style: 'medium', color: { rgb: COLORS.headerBg } },
    bottom: { style: 'medium', color: { rgb: COLORS.headerBg } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } },
  },
}

const createDataStyle = (isOdd: boolean, align: 'left' | 'right' | 'center' = 'left') => ({
  fill: { fgColor: { rgb: isOdd ? COLORS.rowOdd : COLORS.rowEven } },
  font: { sz: 10 },
  alignment: { horizontal: align, vertical: 'center' as const },
  border: {
    top: { style: 'thin', color: { rgb: 'D0D0D0' } },
    bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
    left: { style: 'thin', color: { rgb: 'D0D0D0' } },
    right: { style: 'thin', color: { rgb: 'D0D0D0' } },
  },
})

const createColoredCellStyle = (bgColor: string, fontColor?: string, bold?: boolean) => ({
  fill: { fgColor: { rgb: bgColor } },
  font: { color: { rgb: fontColor || '000000' }, bold: bold || false, sz: 10 },
  alignment: { horizontal: 'center' as const, vertical: 'center' as const },
  border: {
    top: { style: 'thin', color: { rgb: 'D0D0D0' } },
    bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
    left: { style: 'thin', color: { rgb: 'D0D0D0' } },
    right: { style: 'thin', color: { rgb: 'D0D0D0' } },
  },
})

const createCurrencyStyle = (isOdd: boolean, fontColor?: string) => ({
  fill: { fgColor: { rgb: isOdd ? COLORS.rowOdd : COLORS.rowEven } },
  font: { color: { rgb: fontColor || '000000' }, sz: 10 },
  alignment: { horizontal: 'right' as const, vertical: 'center' as const },
  numFmt: '#,##0.00 €',
  border: {
    top: { style: 'thin', color: { rgb: 'D0D0D0' } },
    bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
    left: { style: 'thin', color: { rgb: 'D0D0D0' } },
    right: { style: 'thin', color: { rgb: 'D0D0D0' } },
  },
})

// Format date for Excel display
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Format percentage
const formatPercent = (value: number, total: number): string => {
  if (total <= 0) return '0.0%'
  return ((value / total) * 100).toFixed(1) + '%'
}

// Get status color for hitos
const getHitoStatusColor = (status: string): string => {
  switch (status) {
    case 'pendiente':
      return COLORS.pendiente
    case 'facturado':
      return COLORS.facturado
    case 'cobrado':
      return COLORS.cobrado
    default:
      return COLORS.rowEven
  }
}

// Get project status color
const getProjectStatusColor = (status: string): string => {
  return COLORS[status as keyof typeof COLORS] || COLORS.rowEven
}

interface ExportData {
  record: FinancialRecord
  billing: Billing | null
}

export async function exportFinanzasToExcel(
  data: ExportData[],
  dateRangeLabel?: string
): Promise<void> {
  // Create workbook
  const wb = XLSX.utils.book_new()

  // =====================
  // SHEET 1: Resumen Financiero
  // =====================
  const summaryHeaders = [
    'Proyecto',
    'Cliente',
    'Oficina',
    'Estado',
    'Presupuesto',
    'Cobrado',
    'Cobrado %',
    'Pdte. Cobro',
    'Pdte. Cobro %',
    'Pdte. Factura',
    'Pdte. Factura %',
    'Sin Asignar',
    'Sin Asignar %',
  ]

  const summaryData: (string | number)[][] = [summaryHeaders]

  // Data rows
  for (const { record } of data) {
    summaryData.push([
      record.projectName,
      record.clientName,
      record.office || '-',
      projectStatusLabels[record.projectStatus] || record.projectStatus,
      record.totalBudget,
      record.paymentsReceived,
      formatPercent(record.paymentsReceived, record.totalBudget),
      record.facturado,
      formatPercent(record.facturado, record.totalBudget),
      record.pendiente_factura,
      formatPercent(record.pendiente_factura, record.totalBudget),
      record.unassigned,
      formatPercent(record.unassigned, record.totalBudget),
    ])
  }

  // Add totals row
  const totals = data.reduce(
    (acc, { record }) => {
      acc.totalBudget += record.totalBudget
      acc.paymentsReceived += record.paymentsReceived
      acc.facturado += record.facturado
      acc.pendiente_factura += record.pendiente_factura
      acc.unassigned += record.unassigned
      return acc
    },
    { totalBudget: 0, paymentsReceived: 0, facturado: 0, pendiente_factura: 0, unassigned: 0 }
  )

  summaryData.push([]) // Empty row
  summaryData.push([
    `TOTALES (${data.length} proyectos)`,
    '',
    '',
    '',
    totals.totalBudget,
    totals.paymentsReceived,
    formatPercent(totals.paymentsReceived, totals.totalBudget),
    totals.facturado,
    formatPercent(totals.facturado, totals.totalBudget),
    totals.pendiente_factura,
    formatPercent(totals.pendiente_factura, totals.totalBudget),
    totals.unassigned,
    formatPercent(totals.unassigned, totals.totalBudget),
  ])

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)

  // Apply styles to summary sheet
  // Header row
  for (let col = 0; col < summaryHeaders.length; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
    if (summarySheet[cellRef]) {
      summarySheet[cellRef].s = headerStyle
    }
  }

  // Data rows with alternating colors and colored amounts
  for (let row = 1; row <= data.length; row++) {
    const isOdd = row % 2 === 1
    const record = data[row - 1].record

    for (let col = 0; col < summaryHeaders.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
      if (!summarySheet[cellRef]) continue

      // Apply different styles based on column
      if (col === 3) {
        // Status column - colored by project status
        summarySheet[cellRef].s = createColoredCellStyle(
          getProjectStatusColor(record.projectStatus),
          '000000',
          false
        )
      } else if (col === 4) {
        // Presupuesto
        summarySheet[cellRef].s = createCurrencyStyle(isOdd)
      } else if (col === 5) {
        // Cobrado - green
        summarySheet[cellRef].s = createCurrencyStyle(isOdd, COLORS.cobradoFont)
      } else if (col === 7) {
        // Pdte. Cobro - blue
        summarySheet[cellRef].s = createCurrencyStyle(isOdd, COLORS.pdteCobro)
      } else if (col === 9) {
        // Pdte. Factura - amber
        summarySheet[cellRef].s = createCurrencyStyle(isOdd, COLORS.pdteFactura)
      } else if (col === 11) {
        // Sin Asignar - purple or red if negative
        const color = record.unassigned >= 0 ? COLORS.sinAsignar : COLORS.excess
        summarySheet[cellRef].s = createCurrencyStyle(isOdd, color)
      } else if (col === 6 || col === 8 || col === 10 || col === 12) {
        // Percentage columns
        summarySheet[cellRef].s = createDataStyle(isOdd, 'right')
      } else {
        summarySheet[cellRef].s = createDataStyle(isOdd)
      }
    }
  }

  // Totals row (last row with data)
  const totalsRowIndex = data.length + 2
  for (let col = 0; col < summaryHeaders.length; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: totalsRowIndex, c: col })
    if (summarySheet[cellRef]) {
      summarySheet[cellRef].s = {
        ...totalsStyle,
        alignment: { horizontal: col >= 4 ? 'right' : 'left', vertical: 'center' },
        numFmt: [4, 5, 7, 9, 11].includes(col) ? '#,##0.00 €' : undefined,
      }
    }
  }

  // Set column widths
  summarySheet['!cols'] = [
    { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 18 },
    { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 14 },
    { wch: 12 }, { wch: 14 }, { wch: 13 }, { wch: 14 }, { wch: 12 },
  ]

  // Set row heights
  summarySheet['!rows'] = [{ hpt: 25 }] // Header row height

  XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumen Financiero')

  // =====================
  // SHEET 2: Hitos de Facturación
  // =====================
  const hitosHeaders = [
    'Proyecto',
    'Cliente',
    'Hito',
    'Tipo Importe',
    'Importe',
    'Total',
    'Estado',
    'Fecha Facturación',
    'Fecha Creación',
    'Fecha Actualización',
  ]

  const hitosData: (string | number)[][] = [hitosHeaders]
  const hitoStatusRows: { row: number; status: string }[] = []

  // Data rows
  let currentRow = 1
  for (const { record, billing } of data) {
    if (billing?.hitos_facturacion && billing.hitos_facturacion.length > 0) {
      for (const hito of billing.hitos_facturacion) {
        hitosData.push([
          record.projectName,
          record.clientName,
          hito.nombre || '-',
          hito.tipo_de_importe === 'porcentaje' ? 'Porcentaje' : 'Euro',
          hito.tipo_de_importe === 'porcentaje' ? `${hito.importe}%` : hito.importe,
          hito.total,
          hitoStatusLabels[hito.estado] || hito.estado,
          formatDate(hito.fecha_facturacion),
          formatDate(hito.created_at),
          formatDate(hito.updated_at),
        ])
        hitoStatusRows.push({ row: currentRow, status: hito.estado })
        currentRow++
      }
    } else {
      hitosData.push([
        record.projectName,
        record.clientName,
        'Sin hitos de facturación',
        '-',
        '-',
        0,
        '-',
        '-',
        '-',
        '-',
      ])
      hitoStatusRows.push({ row: currentRow, status: '' })
      currentRow++
    }
  }

  const hitosSheet = XLSX.utils.aoa_to_sheet(hitosData)

  // Apply styles to hitos sheet
  // Header row
  for (let col = 0; col < hitosHeaders.length; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
    if (hitosSheet[cellRef]) {
      hitosSheet[cellRef].s = headerStyle
    }
  }

  // Data rows with status colors
  for (let i = 0; i < hitoStatusRows.length; i++) {
    const { row, status } = hitoStatusRows[i]
    const isOdd = row % 2 === 1

    for (let col = 0; col < hitosHeaders.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
      if (!hitosSheet[cellRef]) continue

      if (col === 6 && status) {
        // Status column - colored by hito status
        hitosSheet[cellRef].s = createColoredCellStyle(
          getHitoStatusColor(status),
          '000000',
          true
        )
      } else if (col === 5) {
        // Total column - currency format
        hitosSheet[cellRef].s = createCurrencyStyle(isOdd)
      } else if (col === 4 && typeof hitosSheet[cellRef].v === 'number') {
        // Importe if it's a number (euro type)
        hitosSheet[cellRef].s = createCurrencyStyle(isOdd)
      } else {
        hitosSheet[cellRef].s = createDataStyle(isOdd, col >= 7 ? 'center' : 'left')
      }
    }
  }

  // Set column widths
  hitosSheet['!cols'] = [
    { wch: 30 }, { wch: 25 }, { wch: 30 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 16 },
    { wch: 16 }, { wch: 16 },
  ]

  hitosSheet['!rows'] = [{ hpt: 25 }]

  XLSX.utils.book_append_sheet(wb, hitosSheet, 'Hitos de Facturación')

  // =====================
  // SHEET 3: Fechas de Proyecto (placeholder)
  // =====================
  const fechasHeaders = [
    'Proyecto',
    'Cliente',
    'Estado',
    'Oficina',
    'Previsión - Fecha Inicio',
    'Previsión - Días Ejecución',
    'Planificación - Fecha Inicio',
    'Ejecución - Fecha Inicio',
    'Ejecución - Fecha Fin',
    'Fecha Creación',
    'Fecha Actualización',
  ]

  const fechasSheet = XLSX.utils.aoa_to_sheet([fechasHeaders])

  // Style header
  for (let col = 0; col < fechasHeaders.length; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
    if (fechasSheet[cellRef]) {
      fechasSheet[cellRef].s = headerStyle
    }
  }

  fechasSheet['!cols'] = [
    { wch: 30 }, { wch: 25 }, { wch: 18 }, { wch: 15 },
    { wch: 20 }, { wch: 22 }, { wch: 24 }, { wch: 22 },
    { wch: 18 }, { wch: 18 }, { wch: 18 },
  ]

  XLSX.utils.book_append_sheet(wb, fechasSheet, 'Fechas Proyecto')

  // Generate filename
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 10)
  const filename = dateRangeLabel
    ? `finanzas_${dateRangeLabel}_${timestamp}.xlsx`
    : `finanzas_${timestamp}.xlsx`

  // Write and download
  XLSX.writeFile(wb, filename)
}

// Extended export that includes project date information
export interface ExportDataWithProject extends ExportData {
  project?: {
    prevision: {
      fecha_inicio: string
      dias_ejecucion: number
    }
    planificacion: {
      fecha_inicio: string
    }
    ejecucion: {
      fecha_inicio: string
      fecha_fin: string
    }
    created_at: string
    updated_at: string
  }
}

export async function exportFinanzasToExcelFull(
  data: ExportDataWithProject[],
  dateRangeLabel?: string
): Promise<void> {
  // Create workbook
  const wb = XLSX.utils.book_new()

  // =====================
  // SHEET 1: Resumen Financiero
  // =====================
  const summaryHeaders = [
    'Proyecto',
    'Cliente',
    'Oficina',
    'Estado',
    'Presupuesto',
    'Cobrado',
    'Cobrado %',
    'Pdte. Cobro',
    'Pdte. Cobro %',
    'Pdte. Factura',
    'Pdte. Factura %',
    'Sin Asignar',
    'Sin Asignar %',
  ]

  const summaryData: (string | number)[][] = [summaryHeaders]

  // Data rows
  for (const { record } of data) {
    summaryData.push([
      record.projectName,
      record.clientName,
      record.office || '-',
      projectStatusLabels[record.projectStatus] || record.projectStatus,
      record.totalBudget,
      record.paymentsReceived,
      formatPercent(record.paymentsReceived, record.totalBudget),
      record.facturado,
      formatPercent(record.facturado, record.totalBudget),
      record.pendiente_factura,
      formatPercent(record.pendiente_factura, record.totalBudget),
      record.unassigned,
      formatPercent(record.unassigned, record.totalBudget),
    ])
  }

  // Add totals row
  const totals = data.reduce(
    (acc, { record }) => {
      acc.totalBudget += record.totalBudget
      acc.paymentsReceived += record.paymentsReceived
      acc.facturado += record.facturado
      acc.pendiente_factura += record.pendiente_factura
      acc.unassigned += record.unassigned
      return acc
    },
    { totalBudget: 0, paymentsReceived: 0, facturado: 0, pendiente_factura: 0, unassigned: 0 }
  )

  summaryData.push([]) // Empty row
  summaryData.push([
    `TOTALES (${data.length} proyectos)`,
    '',
    '',
    '',
    totals.totalBudget,
    totals.paymentsReceived,
    formatPercent(totals.paymentsReceived, totals.totalBudget),
    totals.facturado,
    formatPercent(totals.facturado, totals.totalBudget),
    totals.pendiente_factura,
    formatPercent(totals.pendiente_factura, totals.totalBudget),
    totals.unassigned,
    formatPercent(totals.unassigned, totals.totalBudget),
  ])

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)

  // Apply styles to summary sheet
  // Header row
  for (let col = 0; col < summaryHeaders.length; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
    if (summarySheet[cellRef]) {
      summarySheet[cellRef].s = headerStyle
    }
  }

  // Data rows with alternating colors and colored amounts
  for (let row = 1; row <= data.length; row++) {
    const isOdd = row % 2 === 1
    const record = data[row - 1].record

    for (let col = 0; col < summaryHeaders.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
      if (!summarySheet[cellRef]) continue

      // Apply different styles based on column
      if (col === 3) {
        // Status column - colored by project status
        summarySheet[cellRef].s = createColoredCellStyle(
          getProjectStatusColor(record.projectStatus),
          '000000',
          false
        )
      } else if (col === 4) {
        // Presupuesto
        summarySheet[cellRef].s = createCurrencyStyle(isOdd)
      } else if (col === 5) {
        // Cobrado - green
        summarySheet[cellRef].s = createCurrencyStyle(isOdd, COLORS.cobradoFont)
      } else if (col === 7) {
        // Pdte. Cobro - blue
        summarySheet[cellRef].s = createCurrencyStyle(isOdd, COLORS.pdteCobro)
      } else if (col === 9) {
        // Pdte. Factura - amber
        summarySheet[cellRef].s = createCurrencyStyle(isOdd, COLORS.pdteFactura)
      } else if (col === 11) {
        // Sin Asignar - purple or red if negative
        const color = record.unassigned >= 0 ? COLORS.sinAsignar : COLORS.excess
        summarySheet[cellRef].s = createCurrencyStyle(isOdd, color)
      } else if (col === 6 || col === 8 || col === 10 || col === 12) {
        // Percentage columns
        summarySheet[cellRef].s = createDataStyle(isOdd, 'right')
      } else {
        summarySheet[cellRef].s = createDataStyle(isOdd)
      }
    }
  }

  // Totals row (last row with data)
  const totalsRowIndex = data.length + 2
  for (let col = 0; col < summaryHeaders.length; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: totalsRowIndex, c: col })
    if (summarySheet[cellRef]) {
      summarySheet[cellRef].s = {
        ...totalsStyle,
        alignment: { horizontal: col >= 4 ? 'right' : 'left', vertical: 'center' },
        numFmt: [4, 5, 7, 9, 11].includes(col) ? '#,##0.00 €' : undefined,
      }
    }
  }

  // Set column widths
  summarySheet['!cols'] = [
    { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 18 },
    { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 14 },
    { wch: 12 }, { wch: 14 }, { wch: 13 }, { wch: 14 }, { wch: 12 },
  ]

  summarySheet['!rows'] = [{ hpt: 25 }]

  XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumen Financiero')

  // =====================
  // SHEET 2: Hitos de Facturación
  // =====================
  const hitosHeaders = [
    'Proyecto',
    'Cliente',
    'Hito',
    'Tipo Importe',
    'Importe',
    'Total',
    'Estado',
    'Fecha Facturación',
    'Fecha Creación',
    'Fecha Actualización',
  ]

  const hitosData: (string | number)[][] = [hitosHeaders]
  const hitoStatusRows: { row: number; status: string }[] = []

  // Data rows
  let currentRow = 1
  for (const { record, billing } of data) {
    if (billing?.hitos_facturacion && billing.hitos_facturacion.length > 0) {
      for (const hito of billing.hitos_facturacion) {
        hitosData.push([
          record.projectName,
          record.clientName,
          hito.nombre || '-',
          hito.tipo_de_importe === 'porcentaje' ? 'Porcentaje' : 'Euro',
          hito.tipo_de_importe === 'porcentaje' ? `${hito.importe}%` : hito.importe,
          hito.total,
          hitoStatusLabels[hito.estado] || hito.estado,
          formatDate(hito.fecha_facturacion),
          formatDate(hito.created_at),
          formatDate(hito.updated_at),
        ])
        hitoStatusRows.push({ row: currentRow, status: hito.estado })
        currentRow++
      }
    } else {
      hitosData.push([
        record.projectName,
        record.clientName,
        'Sin hitos de facturación',
        '-',
        '-',
        0,
        '-',
        '-',
        '-',
        '-',
      ])
      hitoStatusRows.push({ row: currentRow, status: '' })
      currentRow++
    }
  }

  const hitosSheet = XLSX.utils.aoa_to_sheet(hitosData)

  // Apply styles to hitos sheet
  // Header row
  for (let col = 0; col < hitosHeaders.length; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
    if (hitosSheet[cellRef]) {
      hitosSheet[cellRef].s = headerStyle
    }
  }

  // Data rows with status colors
  for (let i = 0; i < hitoStatusRows.length; i++) {
    const { row, status } = hitoStatusRows[i]
    const isOdd = row % 2 === 1

    for (let col = 0; col < hitosHeaders.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
      if (!hitosSheet[cellRef]) continue

      if (col === 6 && status) {
        // Status column - colored by hito status
        hitosSheet[cellRef].s = createColoredCellStyle(
          getHitoStatusColor(status),
          '000000',
          true
        )
      } else if (col === 5) {
        // Total column - currency format
        hitosSheet[cellRef].s = createCurrencyStyle(isOdd)
      } else if (col === 4 && typeof hitosSheet[cellRef].v === 'number') {
        // Importe if it's a number (euro type)
        hitosSheet[cellRef].s = createCurrencyStyle(isOdd)
      } else {
        hitosSheet[cellRef].s = createDataStyle(isOdd, col >= 7 ? 'center' : 'left')
      }
    }
  }

  // Set column widths
  hitosSheet['!cols'] = [
    { wch: 30 }, { wch: 25 }, { wch: 30 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 16 },
    { wch: 16 }, { wch: 16 },
  ]

  hitosSheet['!rows'] = [{ hpt: 25 }]

  XLSX.utils.book_append_sheet(wb, hitosSheet, 'Hitos de Facturación')

  // =====================
  // SHEET 3: Fechas de Proyecto
  // =====================
  const fechasHeaders = [
    'Proyecto',
    'Cliente',
    'Estado',
    'Oficina',
    'Previsión - Fecha Inicio',
    'Previsión - Días Ejecución',
    'Planificación - Fecha Inicio',
    'Ejecución - Fecha Inicio',
    'Ejecución - Fecha Fin',
    'Fecha Creación Ficha',
    'Fecha Actualización',
  ]

  const fechasData: (string | number)[][] = [fechasHeaders]

  // Data rows
  for (const { record, project } of data) {
    fechasData.push([
      record.projectName,
      record.clientName,
      projectStatusLabels[record.projectStatus] || record.projectStatus,
      record.office || '-',
      project ? formatDate(project.prevision.fecha_inicio) : '-',
      project?.prevision.dias_ejecucion ?? '-',
      project ? formatDate(project.planificacion.fecha_inicio) : '-',
      project ? formatDate(project.ejecucion.fecha_inicio) : '-',
      project?.ejecucion.fecha_fin ? formatDate(project.ejecucion.fecha_fin) : '-',
      project ? formatDate(project.created_at) : formatDate(record.createdAt),
      project ? formatDate(project.updated_at) : '-',
    ])
  }

  const fechasSheet = XLSX.utils.aoa_to_sheet(fechasData)

  // Apply styles to fechas sheet
  // Header row
  for (let col = 0; col < fechasHeaders.length; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
    if (fechasSheet[cellRef]) {
      fechasSheet[cellRef].s = headerStyle
    }
  }

  // Data rows with alternating colors and status colors
  for (let row = 1; row <= data.length; row++) {
    const isOdd = row % 2 === 1
    const record = data[row - 1].record

    for (let col = 0; col < fechasHeaders.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
      if (!fechasSheet[cellRef]) continue

      if (col === 2) {
        // Status column - colored by project status
        fechasSheet[cellRef].s = createColoredCellStyle(
          getProjectStatusColor(record.projectStatus),
          '000000',
          false
        )
      } else if (col >= 4) {
        // Date columns - centered
        fechasSheet[cellRef].s = createDataStyle(isOdd, 'center')
      } else {
        fechasSheet[cellRef].s = createDataStyle(isOdd)
      }
    }
  }

  // Set column widths
  fechasSheet['!cols'] = [
    { wch: 30 }, { wch: 25 }, { wch: 18 }, { wch: 15 },
    { wch: 20 }, { wch: 22 }, { wch: 24 }, { wch: 22 },
    { wch: 18 }, { wch: 18 }, { wch: 18 },
  ]

  fechasSheet['!rows'] = [{ hpt: 25 }]

  XLSX.utils.book_append_sheet(wb, fechasSheet, 'Fechas Proyecto')

  // Generate filename
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 10)
  const filename = dateRangeLabel
    ? `finanzas_${dateRangeLabel}_${timestamp}.xlsx`
    : `finanzas_${timestamp}.xlsx`

  // Write and download
  XLSX.writeFile(wb, filename)
}
