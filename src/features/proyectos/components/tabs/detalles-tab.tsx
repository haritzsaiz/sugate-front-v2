import { useState, useEffect } from 'react'
import { type Oficina } from '@/lib/types'
import { getAllOficinas } from '@/lib/oficina-service'
import { updateProject } from '@/lib/project-service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { OficinaSelector } from '@/components/oficina-selector'
import { ClienteSelector } from '@/components/cliente-selector'
import { Pencil, Save, X, Loader2 } from 'lucide-react'
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

  // Oficinas data for the badge
  const [oficinas, setOficinas] = useState<Oficina[]>([])

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
    setDetallesData({
      direccion: proyecto.direccion,
      ciudad: proyecto.ciudad,
      oficina: proyecto.oficina || '',
      id_cliente: proyecto.id_cliente,
    })
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
      onProjectUpdate?.(updatedProject)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar los cambios')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setDetallesData({
      direccion: proyecto.direccion,
      ciudad: proyecto.ciudad,
      oficina: proyecto.oficina || '',
      id_cliente: proyecto.id_cliente,
    })
    setIsEditing(false)
  }

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold'>Detalles del Proyecto</h2>
          <p className='text-sm text-muted-foreground'>Información general del proyecto</p>
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
    </div>
  )
}
