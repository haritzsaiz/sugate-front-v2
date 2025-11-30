import { Input } from '@/components/ui/input'
import { useProyectoDetailContext } from '@/features/proyectos/hooks/use-proyecto-detail-context'

export function UbicacionTab() {
  const { proyecto } = useProyectoDetailContext()

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-xl font-bold'>Ubicación</h2>
        <p className='text-sm text-muted-foreground'>Localización del proyecto</p>
      </div>
      <div className='space-y-4'>
        <div>
          <p className='text-sm text-primary mb-2'>Dirección Completa</p>
          <Input 
            value={`${proyecto.direccion}, ${proyecto.ciudad}`} 
            readOnly 
          />
        </div>
        <div className='h-96 rounded border overflow-hidden'>
          <iframe
            title='Ubicación del proyecto'
            width='100%'
            height='100%'
            style={{ border: 0 }}
            loading='lazy'
            allowFullScreen
            referrerPolicy='no-referrer-when-downgrade'
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(`${proyecto.direccion}, ${proyecto.ciudad}`)}`}
          />
        </div>
      </div>
    </div>
  )
}
