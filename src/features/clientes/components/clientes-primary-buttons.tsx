import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ClientesPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' asChild>
        <Link to='/clientes/nuevo'>
          <span>Crear</span> <Plus size={18} />
        </Link>
      </Button>
    </div>
  )
}
