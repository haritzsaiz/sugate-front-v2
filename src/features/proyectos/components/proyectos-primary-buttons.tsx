import { Link } from '@tanstack/react-router'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProyectosPrimaryButtonsProps {
  onRefresh?: () => void
}

export function ProyectosPrimaryButtons({ onRefresh }: ProyectosPrimaryButtonsProps) {
  return (
    <div className='flex gap-2'>
      {onRefresh && (
        <Button variant='outline' className='space-x-1' onClick={onRefresh}>
          <RefreshCw className='h-4 w-4' />
          <span>Actualizar</span>
        </Button>
      )}
      <Button asChild className='space-x-1'>
        <Link to='/proyectos/nuevo'>
          <Plus className='h-4 w-4' />
          <span>Nuevo Proyecto</span>
        </Link>
      </Button>
    </div>
  )
}
