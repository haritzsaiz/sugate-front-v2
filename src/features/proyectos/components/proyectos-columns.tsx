import { type ColumnDef } from '@tanstack/react-table'
import { ExternalLink, Play, Clock, CheckCircle, XCircle, FileText } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import {
  type Proyecto,
  type ProjectStatus,
  projectStatusLabels,
  projectStatusColors,
} from '../data/schema'
import { OficinaBadge } from './oficina-badge'

const statusIcons: Record<ProjectStatus, React.ReactNode> = {
  presupuesto: <FileText className='h-3 w-3' />,
  planificacion: <Clock className='h-3 w-3' />,
  en_ejecucion: <Play className='h-3 w-3' />,
  finalizado: <CheckCircle className='h-3 w-3' />,
  cancelado: <XCircle className='h-3 w-3' />,
}

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
      const label = projectStatusLabels[status] ?? status
      const colorClass = projectStatusColors[status] ?? 'bg-gray-100 text-gray-800 border-gray-200'
      const icon = statusIcons[status] ?? null
      return (
        <Badge
          variant='outline'
          className={`flex w-fit items-center gap-1 ${colorClass}`}
        >
          {icon}
          {label}
        </Badge>
      )
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
