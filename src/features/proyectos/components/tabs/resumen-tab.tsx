import { useState, useEffect } from 'react'
import { type ProjectStatus } from '@/lib/types'
import { updateProject } from '@/lib/project-service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clock, Pencil, Save, X, Loader2, Play, CheckCircle, XCircle, FileText, FileX } from 'lucide-react'
import { projectStatusLabels, projectStatusColors } from '@/features/proyectos/data/schema'
import { useProyectoDetailContext } from '@/features/proyectos/hooks/use-proyecto-detail-context'
import { toast } from 'sonner'

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

  // Reset form data when proyecto changes
  useEffect(() => {
    setResumenData({
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
      onProjectUpdate?.(updatedProject)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar los cambios')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setResumenData({
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
          <div className='flex gap-2'>
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
          <Badge
            variant='outline'
            className={`flex w-fit items-center gap-1 ${projectStatusColors[resumenData.estado] ?? 'bg-gray-100 text-gray-800 border-gray-200'}`}
          >
            {statusIcons[resumenData.estado]}
            {projectStatusLabels[resumenData.estado] ?? resumenData.estado}
          </Badge>
        )}
      </div>

      {/* Previsión Section */}
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

      {/* Planificación Section */}
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
            {formatDate(resumenData.planificacion.fecha_inicio)}
          </div>
        )}
        <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
          <Clock className='h-3 w-3' />
          <span>{getRelativeTime(resumenData.planificacion.fecha_inicio)}</span>
        </div>
      </div>

      {/* Ejecución Section */}
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
              {formatDate(resumenData.ejecucion.fecha_inicio)}
            </div>
          )}
          <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
            <Clock className='h-3 w-3' />
            <span>{getRelativeTime(resumenData.ejecucion.fecha_inicio)}</span>
          </div>
        </div>
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
      </div>
    </div>
  )
}
