import { useState, useEffect, useRef } from 'react'
import { useBlocker } from '@tanstack/react-router'
import { type Oficina } from '@/lib/types'
import { getAllOficinas } from '@/lib/oficina-service'
import { updateProject } from '@/lib/project-service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { OficinaSelector } from '@/components/oficina-selector'
import { ClienteSelector } from '@/components/cliente-selector'
import { Pencil, Save, X, Loader2, Info, Calendar, RefreshCw } from 'lucide-react'
import { OficinaBadge } from '@/features/proyectos/components/oficina-badge'
import { useProyectoDetailContext } from '@/features/proyectos/hooks/use-proyecto-detail-context'
import { toast } from 'sonner'

export function DetallesTab() {
  const { proyecto, cliente, onProjectUpdate } = useProyectoDetailContext()

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [detallesData, setDetallesData] = useState({
    direccion: proyecto.direccion,
    ciudad: proyecto.ciudad,
    oficina: proyecto.oficina || '',
    id_cliente: proyecto.id_cliente,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Store initial data to compare for changes
  const initialDataRef = useRef<string | null>(null)

  // Oficinas data for the badge
  const [oficinas, setOficinas] = useState<Oficina[]>([])

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
      const currentData = JSON.stringify(detallesData)
      setHasUnsavedChanges(currentData !== initialDataRef.current)
    }
  }, [detallesData, isInitialized])

  // Fetch oficinas to get colors
  useEffect(() => {
    const fetchOficinas = async () => {
      try {
        const data = await getAllOficinas()
        setOficinas(data)
      } catch (error) {
        console.error('Error fetching oficinas:', error)
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
    const newData = {
      direccion: proyecto.direccion,
      ciudad: proyecto.ciudad,
      oficina: proyecto.oficina || '',
      id_cliente: proyecto.id_cliente,
    }
    setDetallesData(newData)
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
        direccion: detallesData.direccion,
        ciudad: detallesData.ciudad,
        oficina: detallesData.oficina || undefined,
        id_cliente: detallesData.id_cliente,
      })
      toast.success('Detalles actualizados correctamente')
      setIsEditing(false)
      // Update initial state to match saved state
      initialDataRef.current = JSON.stringify(detallesData)
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
      direccion: proyecto.direccion,
      ciudad: proyecto.ciudad,
      oficina: proyecto.oficina || '',
      id_cliente: proyecto.id_cliente,
    }
    setDetallesData(originalData)
    initialDataRef.current = JSON.stringify(originalData)
    setHasUnsavedChanges(false)
    setIsEditing(false)
  }

  // Format date helper
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold'>Detalles del Proyecto</h2>
          <p className='text-sm text-muted-foreground'>Información general del proyecto</p>
          <div className='mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <Calendar className='h-3 w-3' />
              <span>Creado: {formatDateTime(proyecto.created_at)}</span>
            </div>
            <div className='flex items-center gap-1'>
              <RefreshCw className='h-3 w-3' />
              <span>Actualizado: {formatDateTime(proyecto.updated_at)}</span>
            </div>
          </div>
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
            Has realizado cambios en los detalles del proyecto. Recuerda hacer clic en "Guardar" para no perderlos.
          </AlertDescription>
        </Alert>
      )}

      <div className='space-y-4'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <p className='text-sm text-primary mb-2'>Dirección</p>
            <Input 
              value={isEditing ? detallesData.direccion : proyecto.direccion} 
              onChange={(e) => setDetallesData({ ...detallesData, direccion: e.target.value })}
              readOnly={!isEditing} 
            />
          </div>
          <div>
            <p className='text-sm text-primary mb-2'>Ciudad</p>
            <Input 
              value={isEditing ? detallesData.ciudad : proyecto.ciudad} 
              onChange={(e) => setDetallesData({ ...detallesData, ciudad: e.target.value })}
              readOnly={!isEditing} 
            />
          </div>
          <div>
            <p className='text-sm text-primary mb-2'>Oficina</p>
            {isEditing ? (
              <OficinaSelector
                value={detallesData.oficina}
                onValueChange={(value) => setDetallesData({ ...detallesData, oficina: value })}
                placeholder='Seleccionar oficina...'
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
            {isEditing ? (
              <ClienteSelector
                value={detallesData.id_cliente}
                onValueChange={(value) => setDetallesData({ ...detallesData, id_cliente: value })}
                placeholder='Seleccionar cliente...'
              />
            ) : (
              <Input value={cliente?.nombre_completo || '-'} readOnly />
            )}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning Dialog */}
      <ConfirmDialog
        open={status === 'blocked'}
        onOpenChange={(open) => !open && reset?.()}
        title='Cambios sin guardar'
        desc='Tienes cambios sin guardar en los detalles del proyecto. Si sales ahora, perderás todos los cambios realizados.'
        cancelBtnText='Quedarse'
        confirmText='Salir sin guardar'
        destructive
        handleConfirm={() => proceed?.()}
      />
    </div>
  )
}
