import { type Project } from '@/lib/types'
import { type Client } from '@/lib/client-service'
import { Input } from '@/components/ui/input'
import { Calendar, Clock } from 'lucide-react'

interface ProyectoDetailTabsProps {
  proyecto: Project
  cliente: Client | null
  activeTab: string
}

export function ProyectoDetailTabs({ proyecto, cliente, activeTab }: ProyectoDetailTabsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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
          {/* Previsión Section */}
          <div>
            <h2 className='text-lg font-semibold'>Previsión</h2>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <p className='text-sm mb-2'>Fecha Inicio Prevista</p>
              <div className='relative'>
                <Calendar className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={formatDate(proyecto.prevision.fecha_inicio)}
                  readOnly
                  className='pl-9'
                />
              </div>
              <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                <Clock className='h-3 w-3' />
                <span>{getRelativeTime(proyecto.prevision.fecha_inicio)}</span>
              </div>
            </div>
            <div>
              <p className='text-sm mb-2'>Días de Ejecución Previstos</p>
              <Input
                value={proyecto.prevision.dias_ejecucion.toString()}
                readOnly
              />
            </div>
          </div>

          {/* Planificación Section */}
          <div className='pt-4'>
            <h2 className='text-lg font-semibold'>Planificación</h2>
          </div>
          <div>
            <p className='text-sm mb-2'>Fecha Inicio Planificada</p>
            <div className='relative max-w-md'>
              <Calendar className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={formatDate(proyecto.planificacion.fecha_inicio)}
                readOnly
                className='pl-9'
              />
            </div>
            <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
              <Clock className='h-3 w-3' />
              <span>{getRelativeTime(proyecto.planificacion.fecha_inicio)}</span>
            </div>
          </div>

          {/* Ejecución Section */}
          <div className='pt-4'>
            <h2 className='text-lg font-semibold'>Ejecución</h2>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <p className='text-sm mb-2'>Fecha Inicio Real</p>
              <div className='relative'>
                <Calendar className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={formatDate(proyecto.ejecucion.fecha_inicio)}
                  readOnly
                  className='pl-9'
                />
              </div>
              <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                <Clock className='h-3 w-3' />
                <span>{getRelativeTime(proyecto.ejecucion.fecha_inicio)}</span>
              </div>
            </div>
            <div>
              <p className='text-sm mb-2'>Fecha Fin Real</p>
              <div className='relative'>
                <Calendar className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={proyecto.ejecucion.fecha_fin ? formatDate(proyecto.ejecucion.fecha_fin) : '-'}
                  readOnly
                  className='pl-9'
                />
              </div>
              {proyecto.ejecucion.fecha_fin && (
                <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                  <Clock className='h-3 w-3' />
                  <span>{getRelativeTime(proyecto.ejecucion.fecha_fin)}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Detalles Section */}
      {activeTab === 'detalles' && (
        <>
          <div>
            <h2 className='text-xl font-bold'>Detalles del Proyecto</h2>
            <p className='text-sm text-muted-foreground'>Información general del proyecto</p>
          </div>
          <div className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <p className='text-sm text-primary mb-2'>Dirección</p>
                <Input value={proyecto.direccion} readOnly />
              </div>
              <div>
                <p className='text-sm text-primary mb-2'>Ciudad</p>
                <Input value={proyecto.ciudad} readOnly />
              </div>
              {proyecto.oficina && (
                <div>
                  <p className='text-sm text-primary mb-2'>Oficina</p>
                  <Input value={proyecto.oficina} readOnly />
                </div>
              )}
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
        <>
          <div>
            <h2 className='text-xl font-bold'>Presupuesto</h2>
            <p className='text-sm text-muted-foreground'>Información de presupuestos</p>
          </div>
          <p className='text-muted-foreground'>No hay presupuestos asociados</p>
        </>
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
