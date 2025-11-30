import { type ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Proyecto, type ProjectStatus } from '../data/schema'
import { OficinaBadge } from './oficina-badge'
import { ProyectoStatusBadge } from './proyecto-status-badge'

export const proyectosColumns: ColumnDef<Proyecto>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Seleccionar todo'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Seleccionar fila'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'direccion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dirección' />
    ),
    cell: ({ row }) => {
      const project = row.original
      return (
        <Link
          to='/proyectos/$proyectoId'
          params={{ proyectoId: project.id }}
          className='max-w-[200px] font-medium text-blue-600 hover:underline'
        >
          {row.getValue('direccion')}
        </Link>
      )
    },
  },
  {
    accessorKey: 'ciudad',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ciudad' />
    ),
    cell: ({ row }) => <div>{row.getValue('ciudad')}</div>,
  },
  {
    accessorKey: 'cliente_nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    cell: ({ row }) => <div>{row.getValue('cliente_nombre') || '-'}</div>,
  },
  {
    accessorKey: 'oficina',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Oficina' />
    ),
    cell: ({ row }) => {
      const oficinaNombre = row.getValue('oficina') as string | undefined
      const oficinaColor = row.original.oficina_color
      
      if (!oficinaNombre) return <div>-</div>
      
      return <OficinaBadge nombre={oficinaNombre} color={oficinaColor} />
    },
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('estado') as ProjectStatus
      return <ProyectoStatusBadge status={status} />
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    header: () => <div className='text-right'>Acciones</div>,
    cell: ({ row }) => {
      const project = row.original
      return (
        <div className='flex justify-end'>
          <Button variant='ghost' size='icon' asChild>
            <Link to='/proyectos/$proyectoId' params={{ proyectoId: project.id }}>
              <ExternalLink className='h-4 w-4' />
              <span className='sr-only'>Ver detalles</span>
            </Link>
          </Button>
        </div>
      )
    },
  },
]
