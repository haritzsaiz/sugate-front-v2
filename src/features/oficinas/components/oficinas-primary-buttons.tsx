import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOficinas } from './oficinas-provider'

export function OficinasPrimaryButtons() {
  const { setOpen } = useOficinas()

  return (
    <div className='flex gap-2'>
      <Button className='gap-2' onClick={() => setOpen('create')}>
        <Plus className='h-4 w-4' />
        Nueva Oficina
      </Button>
    </div>
  )
}
