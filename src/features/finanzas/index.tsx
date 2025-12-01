import { useEffect, useState, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { format, parseISO, isWithinInterval } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { getAllProjects } from '@/lib/project-service'
import { getAllClients } from '@/lib/client-service'
import * as BillingService from '@/lib/billing-service'
import type { Project, Billing } from '@/lib/types'
import { calculateBudgetTotals } from '@/lib/types'
import type { Client } from '@/lib/client-service'
import type { FinancialRecord } from './data/schema'
import { FinanzasTable, type FinanzasTableRef } from './components/finanzas-table'
import { FinanzasPrimaryButtons } from './components/finanzas-primary-buttons'
import { exportFinanzasToExcelFull, type ExportDataWithProject } from './utils/excel-export'

// Compute financial record from project and billing data
function computeFinancialRecord(
  project: Project,
  billing: Billing | null,
  client: Client | undefined
): FinancialRecord {
  // Total budget: prefer billing.presupuesto, then fallback to project's approved budget
  const approvedBudget = project.budget_id_aprobado
    ? project.presupuestos?.find((b) => b.id === project.budget_id_aprobado)
    : undefined
  
  // Calculate totals from budget sections
  const billingTotals = calculateBudgetTotals(billing?.presupuesto)
  const approvedBudgetTotals = calculateBudgetTotals(approvedBudget)
  const totalBudget = billingTotals.total || approvedBudgetTotals.total || 0

  // Calculate amounts from billing milestones
  let paymentsReceived = 0 // cobrado
  let facturado = 0 // facturado but not paid
  let pendiente_factura = 0 // pending invoice

  if (billing?.hitos_facturacion) {
    for (const hito of billing.hitos_facturacion) {
      switch (hito.estado) {
        case 'cobrado':
          paymentsReceived += hito.total
          break
        case 'facturado':
          facturado += hito.total
          break
        case 'pendiente':
          pendiente_factura += hito.total
          break
      }
    }
  }

  // Unassigned = total - (cobrado + facturado + pendiente)
  const unassigned = totalBudget - (paymentsReceived + facturado + pendiente_factura)

  return {
    projectId: project.id,
    projectName: project.direccion,
    clientId: project.id_cliente,
    clientName: client?.nombre_completo ?? 'Cliente desconocido',
    office: project.oficina ?? '',
    projectStatus: project.estado,
    createdAt: project.created_at,
    totalBudget,
    paymentsReceived,
    facturado,
    pendiente_factura,
    unassigned,
  }
}

export function Finanzas() {
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)

  // Store projects and billings for export
  const [projectsMap, setProjectsMap] = useState<Map<string, Project>>(new Map())
  const [billingsMap, setBillingsMap] = useState<Map<string, Billing | null>>(new Map())

  // Ref to access table methods
  const tableRef = useRef<FinanzasTableRef>(null)

  // Date range filter
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const fetchData = async () => {
    try {
      setIsFetching(true)
      setError(null)

      // Fetch all data in parallel
      const [projectsData, clientsData] = await Promise.all([
        getAllProjects(),
        getAllClients(),
      ])

      // Filter projects by date range if specified
      let filteredProjects = projectsData
      if (dateRange?.from || dateRange?.to) {
        filteredProjects = projectsData.filter((project) => {
          const projectDate = parseISO(project.created_at)
          if (dateRange.from && dateRange.to) {
            return isWithinInterval(projectDate, {
              start: dateRange.from,
              end: dateRange.to,
            })
          }
          if (dateRange.from) {
            return projectDate >= dateRange.from
          }
          if (dateRange.to) {
            return projectDate <= dateRange.to
          }
          return true
        })
      }

      // Fetch billing only for projects with an approved budget
      const billingPromises = filteredProjects.map((project) =>
        project.budget_id_aprobado
          ? BillingService.getBillingByProjectId(project.id).catch(() => null)
          : Promise.resolve(null)
      )
      const billings = await Promise.all(billingPromises)

      // Create a map for quick client lookup
      const clientsMap = new Map(clientsData.map((c) => [c._id, c]))

      // Compute financial records
      const financialRecords = filteredProjects.map((project, index) => {
        const billing = billings[index]
        const client = clientsMap.get(project.id_cliente)
        return computeFinancialRecord(project, billing, client)
      })

      // Store projects and billings maps for export
      const newProjectsMap = new Map<string, Project>()
      const newBillingsMap = new Map<string, Billing | null>()
      filteredProjects.forEach((project, index) => {
        newProjectsMap.set(project.id, project)
        newBillingsMap.set(project.id, billings[index])
      })
      setProjectsMap(newProjectsMap)
      setBillingsMap(newBillingsMap)

      setRecords(financialRecords)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar datos financieros'
      )
    } finally {
      setIsFetching(false)
      setIsInitialLoad(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])

  // Build office options for filter
  const officeOptions = useMemo(() => {
    const uniqueOffices = new Set(records.map((r) => r.office).filter(Boolean))
    return Array.from(uniqueOffices).map((office) => ({
      label: office,
      value: office,
    }))
  }, [records])

  const handleExportToExcel = async () => {
    try {
      setExportLoading(true)

      // Get rows to export: selected rows if any, otherwise all filtered (visible) rows
      let rowsToExport: FinancialRecord[] = []
      
      if (tableRef.current) {
        const selectedRows = tableRef.current.getSelectedRows()
        if (selectedRows.length > 0) {
          rowsToExport = selectedRows
        } else {
          rowsToExport = tableRef.current.getFilteredRows()
        }
      } else {
        // Fallback to all records if table ref is not available
        rowsToExport = records
      }

      if (rowsToExport.length === 0) {
        toast.warning('Sin datos para exportar', {
          description: 'No hay registros visibles para exportar.',
        })
        return
      }

      // Build export data with project and billing details
      const exportData: ExportDataWithProject[] = rowsToExport.map((record) => {
        const project = projectsMap.get(record.projectId)
        const billing = billingsMap.get(record.projectId) ?? null

        return {
          record,
          billing,
          project: project
            ? {
                prevision: project.prevision,
                planificacion: project.planificacion,
                ejecucion: project.ejecucion,
                created_at: project.created_at,
                updated_at: project.updated_at,
              }
            : undefined,
        }
      })

      // Generate date range label for filename
      const fromDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''
      const toDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''
      const dateRangeLabel = fromDate && toDate ? `${fromDate}_${toDate}` : undefined

      // Export using SheetJS
      await exportFinanzasToExcelFull(exportData, dateRangeLabel)

      const selectedCount = tableRef.current?.getSelectedRows().length ?? 0
      toast.success('Exportación exitosa', {
        description: selectedCount > 0
          ? `Se han exportado ${selectedCount} registros seleccionados.`
          : `Se han exportado ${rowsToExport.length} registros.`,
      })
    } catch (err) {
      console.error('Error exporting to Excel:', err)
      toast.error('Error en la exportación', {
        description: 'No se pudo generar el archivo Excel. Intenta de nuevo.',
      })
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Header */}
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Finanzas</h2>
            <p className='text-muted-foreground'>
              Resumen financiero de todos los proyectos ({records.length} registros)
            </p>
          </div>
          <FinanzasPrimaryButtons
            onRefresh={fetchData}
            refreshLoading={isFetching}
            onExport={handleExportToExcel}
            exportLoading={exportLoading}
          />
        </div>

        {/* Content */}
        {isInitialLoad ? (
          <div className='flex flex-1 items-center justify-center'>
            <p className='text-muted-foreground'>Cargando datos financieros...</p>
          </div>
        ) : error ? (
          <div className='flex flex-1 items-center justify-center'>
            <p className='text-destructive'>{error}</p>
          </div>
        ) : (
          <FinanzasTable
            ref={tableRef}
            data={records}
            isLoading={isFetching}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            officeOptions={officeOptions}
          />
        )}
      </Main>
    </>
  )
}
