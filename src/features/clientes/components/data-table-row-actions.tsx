import { Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { type Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { clienteSchema } from '../data/schema'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const cliente = clienteSchema.parse(row.original)

  return (
    <div className='flex justify-end'>
      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        asChild
      >
        <Link to='/clientes/$clienteId' params={{ clienteId: cliente._id }}>
          <ExternalLink className='h-4 w-4' />
          <span className='sr-only'>Ver cliente</span>
        </Link>
      </Button>
    </div>
  )
}
