import { useState, useEffect } from 'react'
import { type Project, type BudgetSection, type Oficina, type ProjectStatus } from '@/lib/types'
import { type Client } from '@/lib/client-service'
import { getAllOficinas } from '@/lib/oficina-service'
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
import { Clock, Pencil, Save, X, Loader2, Play, CheckCircle, XCircle, FileText } from 'lucide-react'
import { BudgetEditor } from './budget'
import { OficinaBadge } from './oficina-badge'
import { projectStatusLabels, projectStatusColors } from '../data/schema'
import { toast } from 'sonner'

interface ProyectoDetailTabsProps {
  proyecto: Project
  cliente: Client | null
  activeTab: string
  onProjectUpdate?: (updatedProject: Project) => void
}

export function ProyectoDetailTabs({ proyecto, cliente, activeTab, onProjectUpdate }: ProyectoDetailTabsProps) {
  // Status icons mapping
  const statusIcons: Record<ProjectStatus, React.ReactNode> = {
    presupuesto: <FileText className='h-3 w-3' />,
    planificacion: <Clock className='h-3 w-3' />,
    en_ejecucion: <Play className='h-3 w-3' />,
    finalizado: <CheckCircle className='h-3 w-3' />,
    cancelado: <XCircle className='h-3 w-3' />,
  }

  // Edit mode state for Resumen
  const [isEditingResumen, setIsEditingResumen] = useState(false)
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
  const [isSavingResumen, setIsSavingResumen] = useState(false)

  // Edit mode state for Detalles
  const [isEditingDetalles, setIsEditingDetalles] = useState(false)
  const [detallesData, setDetallesData] = useState({
    direccion: proyecto.direccion,
    ciudad: proyecto.ciudad,
    oficina: proyecto.oficina || '',
  })
  const [isSavingDetalles, setIsSavingDetalles] = useState(false)

  // Oficinas data for the badge
  const [oficinas, setOficinas] = useState<Oficina[]>([])
  const [loadingOficinas, setLoadingOficinas] = useState(true)

  // Fetch oficinas to get colors
  useEffect(() => {
    const fetchOficinas = async () => {
      try {
        const data = await getAllOficinas()
        setOficinas(data)
      } catch (error) {
        console.error('Error fetching oficinas:', error)
      } finally {
        setLoadingOficinas(false)
      }
    }
    fetchOficinas()
  }, [])

  // Get oficina color from the oficinas list
  const getOficinaColor = (oficinaNombre: string | undefined): string | undefined => {
    if (!oficinaNombre) return undefined
    const oficina = oficinas.find(
      (o) => o.id === oficinaNombre || o.nombre === oficinaNombre
    )
    return oficina?.color
  }

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
    setDetallesData({
      direccion: proyecto.direccion,
      ciudad: proyecto.ciudad,
      oficina: proyecto.oficina || '',
    })
  }, [proyecto])

  const handleSaveResumen = async () => {
    try {
      setIsSavingResumen(true)
      const updatedProject = await updateProject({
        ...proyecto,
        estado: resumenData.estado,
        prevision: resumenData.prevision,
        planificacion: resumenData.planificacion,
        ejecucion: resumenData.ejecucion,
      })
      toast.success('Resumen actualizado correctamente')
      setIsEditingResumen(false)
      onProjectUpdate?.(updatedProject)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar los cambios')
    } finally {
      setIsSavingResumen(false)
    }
  }

  const handleCancelResumen = () => {
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
    setIsEditingResumen(false)
  }

  const handleSaveDetalles = async () => {
    try {
      setIsSavingDetalles(true)
      const updatedProject = await updateProject({
        ...proyecto,
        direccion: detallesData.direccion,
        ciudad: detallesData.ciudad,
        oficina: detallesData.oficina || undefined,
      })
      toast.success('Detalles actualizados correctamente')
      setIsEditingDetalles(false)
      onProjectUpdate?.(updatedProject)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar los cambios')
    } finally {
      setIsSavingDetalles(false)
    }
  }

  const handleCancelDetalles = () => {
    setDetallesData({
      direccion: proyecto.direccion,
      ciudad: proyecto.ciudad,
      oficina: proyecto.oficina || '',
    })
    setIsEditingDetalles(false)
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
      {/* Resumen Section */}
      {activeTab === 'resumen' && (
        <>
          {/* Section Header with Edit Button */}
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold'>Estado del Proyecto</h2>
            </div>
            {!isEditingResumen ? (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsEditingResumen(true)}
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
                  onClick={handleCancelResumen}
                  disabled={isSavingResumen}
                  className='gap-2'
                >
                  <X className='h-4 w-4' />
                  Cancelar
                </Button>
                <Button
                  size='sm'
                  onClick={handleSaveResumen}
                  disabled={isSavingResumen}
                  className='gap-2'
                >
                  {isSavingResumen ? (
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
            {isEditingResumen ? (
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
              {isEditingResumen ? (
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
                readOnly={!isEditingResumen}
              />
            </div>
          </div>

          {/* Planificación Section */}
          <div className='pt-4'>
            <h2 className='text-lg font-semibold'>Planificación</h2>
          </div>
          <div className='max-w-md'>
            <p className='text-sm mb-2'>Fecha Inicio Planificada</p>
            {isEditingResumen ? (
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
              {isEditingResumen ? (
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
              {isEditingResumen ? (
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
        </>
      )}

      {/* Detalles Section */}
      {activeTab === 'detalles' && (
        <>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-bold'>Detalles del Proyecto</h2>
              <p className='text-sm text-muted-foreground'>Información general del proyecto</p>
            </div>
            {!isEditingDetalles ? (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsEditingDetalles(true)}
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
                  onClick={handleCancelDetalles}
                  disabled={isSavingDetalles}
                  className='gap-2'
                >
                  <X className='h-4 w-4' />
                  Cancelar
                </Button>
                <Button
                  size='sm'
                  onClick={handleSaveDetalles}
                  disabled={isSavingDetalles}
                  className='gap-2'
                >
                  {isSavingDetalles ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Save className='h-4 w-4' />
                  )}
                  Guardar
                </Button>
              </div>
            )}
          </div>
          <div className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <p className='text-sm text-primary mb-2'>Dirección</p>
                <Input 
                  value={isEditingDetalles ? detallesData.direccion : proyecto.direccion} 
                  onChange={(e) => setDetallesData({ ...detallesData, direccion: e.target.value })}
                  readOnly={!isEditingDetalles} 
                />
              </div>
              <div>
                <p className='text-sm text-primary mb-2'>Ciudad</p>
                <Input 
                  value={isEditingDetalles ? detallesData.ciudad : proyecto.ciudad} 
                  onChange={(e) => setDetallesData({ ...detallesData, ciudad: e.target.value })}
                  readOnly={!isEditingDetalles} 
                />
              </div>
              <div>
                <p className='text-sm text-primary mb-2'>Oficina</p>
                {isEditingDetalles ? (
                  <Input 
                    value={detallesData.oficina} 
                    onChange={(e) => setDetallesData({ ...detallesData, oficina: e.target.value })}
                    placeholder='Nombre de la oficina'
                  />
                ) : (
                  <div className='flex h-10 items-center'>
                    {proyecto.oficina ? (
                      <OficinaBadge 
                        nombre={proyecto.oficina} 
                        color={getOficinaColor(proyecto.oficina)} 
                      />
                    ) : (
                      <span className='text-muted-foreground'>-</span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <p className='text-sm text-primary mb-2'>Cliente</p>
                <Input value={cliente?.nombre_completo || '-'} readOnly />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Ubicación Section */}
      {activeTab === 'ubicacion' && (
        <>
          <div>
            <h2 className='text-xl font-bold'>Ubicación</h2>
            <p className='text-sm text-muted-foreground'>Localización del proyecto</p>
          </div>
          <div className='space-y-4'>
            <div>
              <p className='text-sm text-primary mb-2'>Dirección Completa</p>
              <Input 
                value={`${proyecto.direccion}, ${proyecto.ciudad}${proyecto.oficina ? `, ${proyecto.oficina}` : ''}`} 
                readOnly 
              />
            </div>
            <div className='h-64 rounded border bg-muted/50 flex items-center justify-center'>
              <p className='text-muted-foreground'>Mapa no disponible</p>
            </div>
          </div>
        </>
      )}

      {/* Presupuesto Section */}
      {activeTab === 'presupuesto' && (
        <BudgetEditor
          project={proyecto}
          client={cliente}
          onSaveBudgetDetails={(budgetDetails: BudgetSection[]) => {
            // TODO: Implement save to backend
            console.log('Saving budget details:', budgetDetails)
            toast.success('Presupuesto guardado correctamente')
          }}
        />
      )}

      {/* Facturación Section */}
      {activeTab === 'facturacion' && (
        <>
          <div>
            <h2 className='text-xl font-bold'>Facturación</h2>
            <p className='text-sm text-muted-foreground'>Información de facturas</p>
          </div>
          <p className='text-muted-foreground'>No hay facturas asociadas</p>
        </>
      )}

      {/* Admin Section */}
      {activeTab === 'admin' && (
        <>
          <div>
            <h2 className='text-xl font-bold'>Administración</h2>
            <p className='text-sm text-muted-foreground'>Configuración administrativa</p>
          </div>
          <p className='text-muted-foreground'>Sección de administración</p>
        </>
      )}

      {/* Fotos Section */}
      {activeTab === 'fotos' && (
        <>
          <div>
            <h2 className='text-xl font-bold'>Fotos</h2>
            <p className='text-sm text-muted-foreground'>Galería de fotos del proyecto</p>
          </div>
          <p className='text-muted-foreground'>No hay fotos disponibles</p>
        </>
      )}
    </div>
  )
}
