import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useBlocker } from '@tanstack/react-router'
import type { Project, Billing, HitoFacturacion } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  PlusCircle,
  Save,
  Receipt,
  CalendarClock,
  Check,
  CircleDollarSign,
  FileText,
  Zap,
  Info,
  Loader2,
  TrendingUp,
  Clock,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { getBillingByProjectId, createBilling, updateBilling } from '@/lib/billing-service'
import { BillingMilestoneItem } from './billing-milestone-item'

interface BillingTabProps {
  project: Project
  onProjectUpdate?: (updatedProject: Project) => void
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
})

const formatCurrency = (amount: number) => currencyFormatter.format(amount)

const formatPercent = (value: number) =>
  value.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'

export function BillingTab({ project }: BillingTabProps) {
  const [billingData, setBillingData] = useState<Billing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Store initial billing data to compare for changes
  const initialBillingDataRef = useRef<string | null>(null)

  const [isTicketBaiModalOpen, setIsTicketBaiModalOpen] = useState(false)
  const [selectedMilestoneForTicketBai, setSelectedMilestoneForTicketBai] =
    useState<HitoFacturacion | null>(null)
  const [quickCreateInput, setQuickCreateInput] = useState('')

  // Block navigation when there are unsaved changes
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => hasUnsavedChanges,
    withResolver: true,
  })

  // Browser beforeunload event for closing tab/window
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Track changes by comparing current state to initial state
  useEffect(() => {
    if (isInitialized && billingData && initialBillingDataRef.current !== null) {
      const currentData = JSON.stringify(billingData)
      setHasUnsavedChanges(currentData !== initialBillingDataRef.current)
    }
  }, [billingData, isInitialized])

  // Get the approved budget from presupuestos
  const approvedBudget = useMemo(() => {
    if (!project.budget_id_aprobado) return null
    return project.presupuestos?.find((b) => b.id === project.budget_id_aprobado) || null
  }, [project.budget_id_aprobado, project.presupuestos])

  const fetchBillingData = useCallback(async () => {
    if (!project.id) return
    setIsLoading(true)
    try {
      const data = await getBillingByProjectId(project.id)
      setBillingData(data)
      // Store initial state for change detection
      initialBillingDataRef.current = JSON.stringify(data)
      setHasUnsavedChanges(false)
      setIsInitialized(true)
    } catch (error) {
      console.error('Error fetching billing data:', error)
      setBillingData(null)
      initialBillingDataRef.current = null
      setIsInitialized(true)
    } finally {
      setIsLoading(false)
    }
  }, [project.id])

  useEffect(() => {
    fetchBillingData()
  }, [fetchBillingData])

  const milestones = billingData?.hitos_facturacion || []

  const financialSummary = useMemo(() => {
    const total = approvedBudget?.total_con_iva || 0

    const paid = milestones
      .filter((m) => m.estado === 'cobrado')
      .reduce((sum, m) => sum + m.total, 0)
    const outstanding = milestones
      .filter((m) => m.estado === 'facturado')
      .reduce((sum, m) => sum + m.total, 0)
    const pendingInvoice = milestones
      .filter((m) => m.estado === 'pendiente')
      .reduce((sum, m) => sum + m.total, 0)

    const totalAssigned = paid + outstanding + pendingInvoice
    const unassigned = total - totalAssigned

    return { total, paid, outstanding, pendingInvoice, totalAssigned, unassigned }
  }, [approvedBudget, milestones])

  const handleUpdateMilestone = useCallback(
    (updatedMilestone: HitoFacturacion) => {
      if (!billingData) return

      const updatedHitos = billingData.hitos_facturacion.map((m) =>
        m.id === updatedMilestone.id ? updatedMilestone : m
      )

      setBillingData((prev) => (prev ? { ...prev, hitos_facturacion: updatedHitos } : null))
    },
    [billingData]
  )

  const handleCreateBlankBilling = async () => {
    if (!project.id || !approvedBudget) {
      toast.error('Se necesita un proyecto con presupuesto aprobado.')
      return
    }

    try {
      const newBillingData = {
        id_proyecto: project.id,
        direccion_facturacion: '',
        codigo_postal: '',
        presupuesto: approvedBudget,
        hitos_facturacion: [],
      }
      const createdBilling = await createBilling(newBillingData)
      setBillingData(createdBilling)
      // Store initial state for change detection
      initialBillingDataRef.current = JSON.stringify(createdBilling)
      setHasUnsavedChanges(false)
      toast.success('Plan de Facturación creado correctamente.')
    } catch (error) {
      console.error('Error creating blank billing object:', error)
      toast.error('No se pudo crear el plan de facturación.')
    }
  }

  const handleAddMilestone = () => {
    if (!approvedBudget) {
      toast.error('Debes aprobar un presupuesto para añadir un hito.')
      return
    }
    const newMilestone: HitoFacturacion = {
      id: generateId(),
      nombre: '',
      tipo_de_importe: 'porcentaje',
      importe: 0,
      total: 0,
      estado: 'pendiente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setBillingData((prev) => {
      if (!prev) return null
      return {
        ...prev,
        hitos_facturacion: [...prev.hitos_facturacion, newMilestone],
      }
    })
  }

  const handleQuickCreateMilestones = () => {
    if (!approvedBudget) {
      toast.error('Debes aprobar un presupuesto para añadir un hito.')
      return
    }
    const budgetTotal = approvedBudget?.total_con_iva || 0
    if (budgetTotal <= 0) {
      toast.error('No se pueden crear hitos por porcentaje si el presupuesto es 0.')
      return
    }

    const percentages = quickCreateInput
      .split(/\s+/)
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0)
    const totalPercentage = percentages.reduce((sum, p) => sum + p, 0)

    if (totalPercentage > 100) {
      toast.error(`La suma (${totalPercentage}%) supera el 100%.`)
      return
    }

    const newMilestones: HitoFacturacion[] = percentages.map((p, index) => {
      const total = (budgetTotal * p) / 100
      return {
        id: generateId(),
        nombre: `Hito ${index + 1} (${p}%)`,
        tipo_de_importe: 'porcentaje' as const,
        importe: p,
        total: total,
        estado: 'pendiente' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    setBillingData((prev) => {
      if (!prev) return null
      return {
        ...prev,
        hitos_facturacion: [...prev.hitos_facturacion, ...newMilestones],
      }
    })
    setQuickCreateInput('')
    toast.success(`${newMilestones.length} hitos de facturación creados.`)
  }

  const handleDeleteMilestone = (milestoneId: string) => {
    setBillingData((prev) => {
      if (!prev) return null
      return {
        ...prev,
        hitos_facturacion: prev.hitos_facturacion.filter((m) => m.id !== milestoneId),
      }
    })
  }

  const handleSaveChanges = async () => {
    if (!billingData) return

    const totalAssigned = milestones.reduce((sum, m) => sum + m.total, 0)
    const budgetTotal = approvedBudget?.total_con_iva || 0

    if (totalAssigned > budgetTotal + 0.01) {
      toast.error(
        `La suma de los hitos (${formatCurrency(totalAssigned)}) no puede superar el total del presupuesto (${formatCurrency(budgetTotal)}).`
      )
      return
    }

    if (milestones.some((m) => !m.nombre.trim() || m.importe < 0)) {
      toast.error('Todos los hitos deben tener un título y un importe no negativo.')
      return
    }

    try {
      setIsSaving(true)
      const savedBilling = await updateBilling(billingData)
      setBillingData(savedBilling)
      // Update initial state to match saved state
      initialBillingDataRef.current = JSON.stringify(savedBilling)
      setHasUnsavedChanges(false)
      toast.success('Los hitos de facturación han sido guardados correctamente.')
    } catch (error) {
      console.error('Error saving billing data:', error)
      toast.error('No se pudieron guardar los datos de facturación.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEmitTicketBai = async () => {
    if (!selectedMilestoneForTicketBai) return

    try {
      toast.success(`Factura emitida para: ${selectedMilestoneForTicketBai.nombre}`)

      const updatedMilestone = { ...selectedMilestoneForTicketBai, estado: 'facturado' as const }
      handleUpdateMilestone(updatedMilestone)

      setIsTicketBaiModalOpen(false)
      setSelectedMilestoneForTicketBai(null)
    } catch (error) {
      console.error('Error emitting TicketBai:', error)
      toast.error('No se pudo procesar la emisión con TicketBai.')
    }
  }

  const handleOpenTicketBaiModal = (milestone: HitoFacturacion) => {
    if (milestone.estado !== 'pendiente') {
      toast.error('Solo se pueden facturar hitos pendientes.')
      return
    }

    if (!milestone.nombre.trim() || milestone.total <= 0) {
      toast.error('El hito debe tener título e importe total válidos.')
      return
    }

    setSelectedMilestoneForTicketBai(milestone)
    setIsTicketBaiModalOpen(true)
  }

  const progressBarData = useMemo(() => {
    const { total, paid, outstanding, pendingInvoice, unassigned } = financialSummary
    if (total <= 0)
      return {
        paidPercent: 0,
        outstandingPercent: 0,
        pendingInvoicePercent: 0,
        unassignedPercent: 0,
        excessPercent: 0,
      }

    const paidPercent = (paid / total) * 100
    const outstandingPercent = (outstanding / total) * 100
    const pendingInvoicePercent = (pendingInvoice / total) * 100
    const unassignedPercent = unassigned > 0 ? (unassigned / total) * 100 : 0
    const excessPercent = unassigned < 0 ? (Math.abs(unassigned) / total) * 100 : 0

    return { paidPercent, outstandingPercent, pendingInvoicePercent, unassignedPercent, excessPercent }
  }, [financialSummary])

  // Show message if no approved budget
  if (!approvedBudget) {
    return (
      <Alert className='border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100'>
        <Info className='h-4 w-4' />
        <AlertTitle>Presupuesto no Aprobado</AlertTitle>
        <AlertDescription>
          Para gestionar la facturación, primero debes ir a la pestaña de "Presupuesto" y marcar una
          de las versiones como "Aprobada".
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <span className='ml-2 text-muted-foreground'>Cargando datos de facturación...</span>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold'>Facturación</h2>
          <p className='text-sm text-muted-foreground'>Gestión de hitos y cobros del proyecto</p>
        </div>
        {milestones.length > 0 && (
          <div className='flex items-center gap-2'>
            {hasUnsavedChanges && (
              <span className='text-sm text-amber-600 dark:text-amber-400'>
                Cambios sin guardar
              </span>
            )}
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
              size='sm'
              className='gap-2'
              variant={hasUnsavedChanges ? 'default' : 'outline'}
            >
              {isSaving ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Save className='h-4 w-4' />
              )}
              Guardar
            </Button>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-2xl font-bold text-green-600'>
            {formatCurrency(financialSummary.paid)}
          </p>
          <p className='text-xs text-muted-foreground'>Cobrado</p>
        </div>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-2xl font-bold text-blue-600'>
            {formatCurrency(financialSummary.outstanding)}
          </p>
          <p className='text-xs text-muted-foreground'>Factura emitida - Pdte. Cobro</p>
        </div>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-2xl font-bold'>
            {formatCurrency(financialSummary.total)}
          </p>
          <p className='text-xs text-muted-foreground'>Total Presupuesto</p>
        </div>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-2xl font-bold text-destructive'>
            {formatCurrency(Math.abs(financialSummary.unassigned))}
          </p>
          <p className='text-xs text-muted-foreground'>
            {financialSummary.unassigned < 0 ? 'Sobre Asignado' : 'Sin Asignar'}
          </p>
        </div>
      </div>

      {/* Progress Bar Section */}
      {financialSummary.total > 0 && (
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
            <h3 className='text-sm font-medium'>Progreso de Facturación</h3>
          </div>
          <div className='space-y-4'>
            <TooltipProvider>
              <div className='relative flex h-6 w-full overflow-hidden rounded-full border bg-muted'>
                <div
                  className='flex h-full'
                  style={{ width: `${100 - progressBarData.excessPercent}%` }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className='h-full bg-green-500 transition-all duration-500'
                        style={{ width: `${progressBarData.paidPercent}%` }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Cobrado: {formatCurrency(financialSummary.paid)} (
                        {formatPercent(progressBarData.paidPercent)})
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className='h-full bg-blue-500 transition-all duration-500'
                        style={{ width: `${progressBarData.outstandingPercent}%` }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Factura emitida - Pdte. Cobro: {formatCurrency(financialSummary.outstanding)} (
                        {formatPercent(progressBarData.outstandingPercent)})
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className='h-full bg-amber-400 transition-all duration-500'
                        style={{ width: `${progressBarData.pendingInvoicePercent}%` }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Pendiente de Facturar: {formatCurrency(financialSummary.pendingInvoice)} (
                        {formatPercent(progressBarData.pendingInvoicePercent)})
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  {financialSummary.unassigned > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className='h-full bg-muted-foreground/20 transition-all duration-500'
                          style={{ width: `${progressBarData.unassignedPercent}%` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Sin Asignar: {formatCurrency(financialSummary.unassigned)} (
                          {formatPercent(progressBarData.unassignedPercent)})
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {financialSummary.unassigned < 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className='absolute right-0 h-full bg-destructive/50 transition-all duration-500'
                        style={{ width: `${progressBarData.excessPercent}%` }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Exceso: {formatCurrency(Math.abs(financialSummary.unassigned))} (
                        {formatPercent(progressBarData.excessPercent)})
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
            
            {/* Legend */}
            <div className='flex flex-wrap gap-4 text-xs'>
              <div className='flex items-center gap-1.5'>
                <div className='h-3 w-3 rounded-full bg-green-500' />
                <span className='text-muted-foreground'>Cobrado</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <div className='h-3 w-3 rounded-full bg-blue-500' />
                <span className='text-muted-foreground'>Factura emitida - Pdte. Cobro</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <div className='h-3 w-3 rounded-full bg-amber-400' />
                <span className='text-muted-foreground'>Pdte. Facturar</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <div className='h-3 w-3 rounded-full bg-muted-foreground/20' />
                <span className='text-muted-foreground'>Sin Asignar</span>
              </div>
            </div>

            <Separator />

            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-5'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <CircleDollarSign className='h-4 w-4 text-muted-foreground' />
                  <span className='text-xs text-muted-foreground'>Presupuesto</span>
                </div>
                <p className='text-lg font-semibold'>{formatCurrency(financialSummary.total)}</p>
              </div>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Check className='h-4 w-4 text-green-600' />
                  <span className='text-xs text-muted-foreground'>Cobrado</span>
                </div>
                <p className='text-lg font-semibold text-green-600'>
                  {formatCurrency(financialSummary.paid)}
                </p>
              </div>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4 text-blue-600' />
                  <span className='text-xs text-muted-foreground'>Factura emitida - Pdte. Cobro</span>
                </div>
                <p className='text-lg font-semibold text-blue-600'>
                  {formatCurrency(financialSummary.outstanding)}
                </p>
              </div>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <CalendarClock className='h-4 w-4 text-amber-600' />
                  <span className='text-xs text-muted-foreground'>Pdte. Facturar</span>
                </div>
                <p className='text-lg font-semibold text-amber-600'>
                  {formatCurrency(financialSummary.pendingInvoice)}
                </p>
              </div>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Wallet
                    className={`h-4 w-4 ${financialSummary.unassigned >= 0 ? 'text-muted-foreground' : 'text-destructive'}`}
                  />
                  <span className='text-xs text-muted-foreground'>Sin Asignar</span>
                </div>
                <p
                  className={`text-lg font-semibold ${financialSummary.unassigned < 0 ? 'text-destructive' : ''}`}
                >
                  {formatCurrency(financialSummary.unassigned)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Content */}
      {!billingData ? (
        <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16'>
          <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
            <Receipt className='h-8 w-8 text-muted-foreground' />
          </div>
          <h3 className='mb-2 text-lg font-semibold'>Sin plan de facturación</h3>
          <p className='mb-6 max-w-sm text-center text-sm text-muted-foreground'>
            Crea un plan de facturación para gestionar los hitos y cobros del proyecto.
          </p>
          <Button onClick={handleCreateBlankBilling} className='gap-2'>
            <PlusCircle className='h-4 w-4' />
            Crear Plan de Facturación
          </Button>
        </div>
      ) : (
        <>
          {/* Billing Address Section */}
          <div className='space-y-4'>
            <div>
              <div className='flex items-center gap-2'>
                <FileText className='h-4 w-4 text-muted-foreground' />
                <h3 className='text-sm font-medium'>Datos de Facturación</h3>
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                Información para las emisiones con TicketBai.
              </p>
            </div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='billing-address'>Dirección de Facturación</Label>
                <Input
                  id='billing-address'
                  value={billingData?.direccion_facturacion || ''}
                  onChange={(e) =>
                    billingData &&
                    setBillingData({ ...billingData, direccion_facturacion: e.target.value })
                  }
                  placeholder='Calle Mayor 123, 1º A'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='postal-code'>Código Postal</Label>
                <Input
                  id='postal-code'
                  value={billingData?.codigo_postal || ''}
                  onChange={(e) =>
                    billingData &&
                    setBillingData({ ...billingData, codigo_postal: e.target.value })
                  }
                  placeholder='20001'
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Hitos Section */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='flex items-center gap-2'>
                  <CalendarClock className='h-4 w-4 text-muted-foreground' />
                  <h3 className='text-sm font-medium'>Hitos de Facturación</h3>
                </div>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Define los plazos y cantidades para la facturación del proyecto.
                </p>
              </div>
              {milestones.length > 0 && (
                <Button onClick={handleAddMilestone} size='sm' variant='outline' className='gap-2'>
                  <PlusCircle className='h-4 w-4' />
                  Añadir Hito
                </Button>
              )}
            </div>

            {/* Unsaved Changes Alert */}
            {hasUnsavedChanges && (
              <Alert className='border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100'>
                <Info className='h-4 w-4' />
                <AlertTitle>Cambios sin guardar</AlertTitle>
                <AlertDescription>
                  Has realizado cambios en la facturación. Recuerda hacer clic en "Guardar Cambios" para no perderlos.
                </AlertDescription>
              </Alert>
            )}

            <div className='space-y-4'>
              {milestones.length > 0 ? (
                <div className='space-y-3'>
                  {milestones.map((milestone) => (
                    <BillingMilestoneItem
                      key={milestone.id}
                      milestone={milestone}
                      budgetTotal={approvedBudget?.total_con_iva || 0}
                      onUpdate={handleUpdateMilestone}
                      onDelete={handleDeleteMilestone}
                      onTicketBai={handleOpenTicketBaiModal}
                      isNew={!milestone.nombre}
                    />
                  ))}
                </div>
              ) : (
                <div className='rounded-lg border-2 border-dashed py-12 text-center'>
                  <div className='flex flex-col items-center gap-4'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                      <CalendarClock className='h-6 w-6 text-muted-foreground' />
                    </div>
                    <div>
                      <p className='mb-1 font-semibold'>Sin hitos de facturación</p>
                      <p className='text-sm text-muted-foreground'>
                        Crea hitos manualmente o genera varios a partir de porcentajes.
                      </p>
                    </div>
                    
                    <div className='mx-auto mt-4 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2'>
                      <div className='space-y-3 rounded-lg border bg-card p-4 text-left'>
                        <div className='flex items-center gap-2'>
                          <Zap className='h-4 w-4 text-amber-500' />
                          <span className='font-medium'>Creación Rápida</span>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          Porcentajes separados por espacios (ej: "40 30 30")
                        </p>
                        <div className='flex gap-2'>
                          <Input
                            value={quickCreateInput}
                            onChange={(e) => setQuickCreateInput(e.target.value)}
                            placeholder='40 30 30'
                            className='h-9'
                          />
                          <Button size='sm' onClick={handleQuickCreateMilestones}>
                            Generar
                          </Button>
                        </div>
                      </div>
                      <div className='space-y-3 rounded-lg border bg-card p-4 text-left'>
                        <div className='flex items-center gap-2'>
                          <PlusCircle className='h-4 w-4 text-primary' />
                          <span className='font-medium'>Creación Manual</span>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          Añade hitos uno a uno con control total.
                        </p>
                        <Button size='sm' className='w-full gap-2' onClick={handleAddMilestone}>
                          <PlusCircle className='h-4 w-4' />
                          Crear Hito
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {milestones.length > 0 && (
                <div className='flex justify-end pt-4'>
                  <Button onClick={handleSaveChanges} disabled={isSaving} className='gap-2'>
                    {isSaving ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Save className='h-4 w-4' />
                    )}
                    Guardar Cambios
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* TicketBai Confirmation Modal */}
      <Dialog open={isTicketBaiModalOpen} onOpenChange={setIsTicketBaiModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5 text-primary' />
              Confirmar Emisión TicketBai
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres emitir una factura con TicketBai para este hito?
            </DialogDescription>
          </DialogHeader>

          {selectedMilestoneForTicketBai && (
            <div className='space-y-4 py-4'>
              <div className='rounded-lg bg-muted p-4'>
                <h4 className='font-semibold'>{selectedMilestoneForTicketBai.nombre}</h4>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Importe: {formatCurrency(selectedMilestoneForTicketBai.total)}
                </p>
              </div>

              <div className='space-y-2'>
                <p className='text-sm font-medium'>Dirección de Facturación:</p>
                <p className='text-sm text-muted-foreground'>
                  {billingData?.direccion_facturacion || 'No especificada'}
                </p>
                {billingData?.codigo_postal && (
                  <p className='text-sm text-muted-foreground'>CP: {billingData?.codigo_postal}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsTicketBaiModalOpen(false)
                setSelectedMilestoneForTicketBai(null)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleEmitTicketBai} className='gap-2'>
              <FileText className='h-4 w-4' />
              Emitir TicketBai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Warning Dialog */}
      <ConfirmDialog
        open={status === 'blocked'}
        onOpenChange={(open) => !open && reset?.()}
        title='Cambios sin guardar'
        desc='Tienes cambios sin guardar en la facturación. Si sales ahora, perderás todos los cambios realizados.'
        cancelBtnText='Quedarse'
        confirmText='Salir sin guardar'
        destructive
        handleConfirm={() => proceed?.()}
      />
    </div>
  )
}
