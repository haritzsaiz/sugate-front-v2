import { useState, useEffect, useMemo, useRef } from 'react'
import { useBlocker } from '@tanstack/react-router'
import { type ProjectStatus } from '@/lib/types'
import { updateProject } from '@/lib/project-service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/date-picker'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clock, Pencil, Save, X, Loader2, Play, CheckCircle, XCircle, FileText, FileX, Info } from 'lucide-react'
import { projectStatusLabels } from '@/features/proyectos/data/schema'
import { ProyectoStatusBadge } from '@/features/proyectos/components/proyecto-status-badge'
import { useProyectoDetailContext } from '@/features/proyectos/hooks/use-proyecto-detail-context'
import { toast } from 'sonner'

// Define which date sections should be visible for each state
const getVisibleSections = (estado: ProjectStatus) => {
  switch (estado) {
    case 'presupuesto':
    case 'presupuesto_abandonado':
      // Only show prevision for budget states
      return { prevision: true, planificacion: false, ejecucion: false }
    case 'planificacion':
      // Show prevision and planificacion
      return { prevision: true, planificacion: true, ejecucion: false }
    case 'en_ejecucion':
      // Show all sections, but ejecucion.fecha_fin is optional
      return { prevision: true, planificacion: true, ejecucion: true, ejecucionFechaFin: false }
    case 'finalizado':
    case 'cancelado':
      // Show all sections including fecha_fin
      return { prevision: true, planificacion: true, ejecucion: true, ejecucionFechaFin: true }
    default:
      return { prevision: true, planificacion: false, ejecucion: false }
  }
}

export function ResumenTab() {
  const { proyecto, onProjectUpdate } = useProyectoDetailContext()

  // Status icons mapping
  const statusIcons: Record<ProjectStatus, React.ReactNode> = {
    presupuesto: <FileText className='h-3 w-3' />,
    presupuesto_abandonado: <FileX className='h-3 w-3' />,
    planificacion: <Clock className='h-3 w-3' />,
    en_ejecucion: <Play className='h-3 w-3' />,
    finalizado: <CheckCircle className='h-3 w-3' />,
    cancelado: <XCircle className='h-3 w-3' />,
  }

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [resumenData, setResumenData] = useState({
    estado: proyecto.estado as ProjectStatus,
    prevision: {
      fecha_inicio: proyecto.prevision.fecha_inicio,
      dias_ejecucion: proyecto.prevision.dias_ejecucion,
    },
    planificacion: {
      fecha_inicio: proyecto.planificacion.fecha_inicio,
    },
    ejecucion: {
      fecha_inicio: proyecto.ejecucion.fecha_inicio,
      fecha_fin: proyecto.ejecucion.fecha_fin,
    },
  })
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Store initial data to compare for changes
  const initialDataRef = useRef<string | null>(null)

  // Determine which sections to show based on current state
  const visibleSections = useMemo(() => getVisibleSections(resumenData.estado), [resumenData.estado])

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
    if (isInitialized && initialDataRef.current !== null) {
      const currentData = JSON.stringify(resumenData)
      setHasUnsavedChanges(currentData !== initialDataRef.current)
    }
  }, [resumenData, isInitialized])

  // Reset form data when proyecto changes
  useEffect(() => {
    const newData = {
      estado: proyecto.estado as ProjectStatus,
      prevision: {
        fecha_inicio: proyecto.prevision.fecha_inicio,
        dias_ejecucion: proyecto.prevision.dias_ejecucion,
      },
      planificacion: {
        fecha_inicio: proyecto.planificacion.fecha_inicio,
      },
      ejecucion: {
        fecha_inicio: proyecto.ejecucion.fecha_inicio,
        fecha_fin: proyecto.ejecucion.fecha_fin,
      },
    }
    setResumenData(newData)
    // Store initial state for change detection
    initialDataRef.current = JSON.stringify(newData)
    setHasUnsavedChanges(false)
    setIsInitialized(true)
  }, [proyecto])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const updatedProject = await updateProject({
        ...proyecto,
        estado: resumenData.estado,
        prevision: resumenData.prevision,
        planificacion: resumenData.planificacion,
        ejecucion: resumenData.ejecucion,
      })
      toast.success('Resumen actualizado correctamente')
      setIsEditing(false)
      // Update initial state to match saved state
      initialDataRef.current = JSON.stringify(resumenData)
      setHasUnsavedChanges(false)
      onProjectUpdate?.(updatedProject)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar los cambios')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    const originalData = {
      estado: proyecto.estado as ProjectStatus,
      prevision: {
        fecha_inicio: proyecto.prevision.fecha_inicio,
        dias_ejecucion: proyecto.prevision.dias_ejecucion,
      },
      planificacion: {
        fecha_inicio: proyecto.planificacion.fecha_inicio,
      },
      ejecucion: {
        fecha_inicio: proyecto.ejecucion.fecha_inicio,
        fecha_fin: proyecto.ejecucion.fecha_fin,
      },
    }
    setResumenData(originalData)
    initialDataRef.current = JSON.stringify(originalData)
    setHasUnsavedChanges(false)
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Helper to parse date string to Date object
  const parseDate = (dateString: string | undefined): Date | undefined => {
    if (!dateString) return undefined
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? undefined : date
  }

  // Helper to convert Date to ISO string
  const toISOString = (date: Date | undefined): string => {
    if (!date) return ''
    return date.toISOString()
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'hoy'
    if (diffDays === 1) return 'hace 1 día'
    if (diffDays > 0 && diffDays < 30) return `hace ${diffDays} días`
    if (diffDays >= 30 && diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return months === 1 ? 'hace 1 mes' : `hace ${months} meses`
    }
    if (diffDays >= 365) {
      const years = Math.floor(diffDays / 365)
      return years === 1 ? 'hace 1 año' : `hace ${years} años`
    }
    // Future dates
    if (diffDays < 0 && diffDays > -30) return `en ${Math.abs(diffDays)} días`
    if (diffDays <= -30 && diffDays > -365) {
      const months = Math.floor(Math.abs(diffDays) / 30)
      return months === 1 ? 'en 1 mes' : `en ${months} meses`
    }
    return `hace casi ${Math.abs(Math.floor(diffDays / 365))} años`
  }

  return (
    <div className='space-y-8'>
      {/* Section Header with Edit Button */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold'>Estado del Proyecto</h2>
        </div>
        {!isEditing ? (
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsEditing(true)}
            className='gap-2'
          >
            <Pencil className='h-4 w-4' />
            Editar
          </Button>
        ) : (
          <div className='flex items-center gap-2'>
            {hasUnsavedChanges && (
              <span className='text-sm text-amber-600 dark:text-amber-400'>
                Cambios sin guardar
              </span>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={handleCancel}
              disabled={isSaving}
              className='gap-2'
            >
              <X className='h-4 w-4' />
              Cancelar
            </Button>
            <Button
              size='sm'
              onClick={handleSave}
              disabled={isSaving}
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

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <Alert className='border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100'>
          <Info className='h-4 w-4' />
          <AlertTitle>Cambios sin guardar</AlertTitle>
          <AlertDescription>
            Has realizado cambios en el resumen del proyecto. Recuerda hacer clic en "Guardar" para no perderlos.
          </AlertDescription>
        </Alert>
      )}

      {/* Status Section */}
      <div className='max-w-md'>
        <p className='text-sm mb-2'>Estado Actual</p>
        {isEditing ? (
          <Select
            value={resumenData.estado}
            onValueChange={(value: ProjectStatus) => setResumenData({
              ...resumenData,
              estado: value
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder='Seleccionar estado' />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(projectStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  <div className='flex items-center gap-2'>
                    {statusIcons[value as ProjectStatus]}
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <ProyectoStatusBadge status={resumenData.estado} />
        )}
      </div>

      {/* Previsión Section - Always visible */}
      <div className='pt-4'>
        <h2 className='text-lg font-semibold'>Previsión</h2>
      </div>
      <div className='grid gap-4 sm:grid-cols-2'>
        <div>
          <p className='text-sm mb-2'>Fecha Inicio Prevista</p>
          {isEditing ? (
            <DatePicker
              selected={parseDate(resumenData.prevision.fecha_inicio)}
              onSelect={(date) => setResumenData({
                ...resumenData,
                prevision: { ...resumenData.prevision, fecha_inicio: toISOString(date) }
              })}
              placeholder='Seleccionar fecha'
            />
          ) : (
            <div className='flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm'>
              {formatDate(resumenData.prevision.fecha_inicio)}
            </div>
          )}
          <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
            <Clock className='h-3 w-3' />
            <span>{getRelativeTime(resumenData.prevision.fecha_inicio)}</span>
          </div>
        </div>
        <div>
          <p className='text-sm mb-2'>Días de Ejecución Previstos</p>
          <Input
            type='number'
            value={resumenData.prevision.dias_ejecucion}
            onChange={(e) => setResumenData({
              ...resumenData,
              prevision: { ...resumenData.prevision, dias_ejecucion: parseInt(e.target.value) || 0 }
            })}
            readOnly={!isEditing}
          />
        </div>
      </div>

      {/* Planificación Section - Visible from planificacion state onwards */}
      {visibleSections.planificacion && (
        <>
          <div className='pt-4'>
            <h2 className='text-lg font-semibold'>Planificación</h2>
          </div>
          <div className='max-w-md'>
            <p className='text-sm mb-2'>Fecha Inicio Planificada</p>
            {isEditing ? (
              <DatePicker
                selected={parseDate(resumenData.planificacion.fecha_inicio)}
                onSelect={(date) => setResumenData({
                  ...resumenData,
                  planificacion: { fecha_inicio: toISOString(date) }
                })}
                placeholder='Seleccionar fecha'
              />
            ) : (
              <div className='flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm'>
                {resumenData.planificacion.fecha_inicio ? formatDate(resumenData.planificacion.fecha_inicio) : '-'}
              </div>
            )}
            {resumenData.planificacion.fecha_inicio && (
              <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                <Clock className='h-3 w-3' />
                <span>{getRelativeTime(resumenData.planificacion.fecha_inicio)}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Ejecución Section - Visible from en_ejecucion state onwards */}
      {visibleSections.ejecucion && (
        <>
          <div className='pt-4'>
            <h2 className='text-lg font-semibold'>Ejecución</h2>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <p className='text-sm mb-2'>Fecha Inicio Real</p>
              {isEditing ? (
                <DatePicker
                  selected={parseDate(resumenData.ejecucion.fecha_inicio)}
                  onSelect={(date) => setResumenData({
                    ...resumenData,
                    ejecucion: { ...resumenData.ejecucion, fecha_inicio: toISOString(date) }
                  })}
                  placeholder='Seleccionar fecha'
                />
              ) : (
                <div className='flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm'>
                  {resumenData.ejecucion.fecha_inicio ? formatDate(resumenData.ejecucion.fecha_inicio) : '-'}
                </div>
              )}
              {resumenData.ejecucion.fecha_inicio && (
                <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                  <Clock className='h-3 w-3' />
                  <span>{getRelativeTime(resumenData.ejecucion.fecha_inicio)}</span>
                </div>
              )}
            </div>
            {/* Fecha Fin - Only visible for finalizado/cancelado states */}
            {visibleSections.ejecucionFechaFin && (
              <div>
                <p className='text-sm mb-2'>Fecha Fin Real</p>
                {isEditing ? (
                  <DatePicker
                    selected={parseDate(resumenData.ejecucion.fecha_fin)}
                    onSelect={(date) => setResumenData({
                      ...resumenData,
                      ejecucion: { ...resumenData.ejecucion, fecha_fin: toISOString(date) }
                    })}
                    placeholder='Seleccionar fecha'
                  />
                ) : (
                  <div className='flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm'>
                    {resumenData.ejecucion.fecha_fin ? formatDate(resumenData.ejecucion.fecha_fin) : '-'}
                  </div>
                )}
                {resumenData.ejecucion.fecha_fin && (
                  <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                    <Clock className='h-3 w-3' />
                    <span>{getRelativeTime(resumenData.ejecucion.fecha_fin)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Unsaved Changes Warning Dialog */}
      <ConfirmDialog
        open={status === 'blocked'}
        onOpenChange={(open) => !open && reset?.()}
        title='Cambios sin guardar'
        desc='Tienes cambios sin guardar en el resumen del proyecto. Si sales ahora, perderás todos los cambios realizados.'
        cancelBtnText='Quedarse'
        confirmText='Salir sin guardar'
        destructive
        handleConfirm={() => proceed?.()}
      />
    </div>
  )
}
