import { type ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import {
  type FinancialRecord,
  type ProjectStatus,
  projectStatusLabels,
  projectStatusColors,
} from '../data/schema'
import { FinancialProgressBar, formatCurrency } from './financial-progress-bar'

function AmountCell({
  amount,
  total,
  colorClass = 'text-foreground',
}: {
  amount: number
  total: number
  colorClass?: string
}) {
  const percentage = total > 0 ? (amount / total) * 100 : 0
  return (
    <div className='text-right'>
      <p className={cn(colorClass, 'text-xs font-semibold leading-tight')}>
        {formatCurrency(amount)}
      </p>
      <p className='text-muted-foreground text-xs leading-tight'>
        ({percentage.toFixed(1)}%)
      </p>
    </div>
  )
}

export const finanzasColumns: ColumnDef<FinancialRecord>[] = [
  {
    id: 'select',
    size: 40,
    minSize: 40,
    maxSize: 40,
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
    accessorKey: 'projectName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Proyecto' />
    ),
    cell: ({ row }) => {
      const record = row.original
      return (
        <div className='max-w-[200px]'>
          <Link
            to='/proyectos/$proyectoId'
            params={{ proyectoId: record.projectId }}
            className='text-primary block truncate font-medium hover:underline'
          >
            {record.projectName}
          </Link>
          <Link
            to='/clientes/$clienteId'
            params={{ clienteId: record.clientId }}
            className='text-muted-foreground block truncate text-xs hover:underline'
          >
            {record.clientName}
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: 'office',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Oficina' />
    ),
    cell: ({ row }) => <div>{row.getValue('office') || '-'}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'projectStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('projectStatus') as ProjectStatus
      const statusLabel = projectStatusLabels[status] || status
      const statusColor = projectStatusColors[status] || ''
      return (
        <Badge
          variant='outline'
          className={cn('rounded-md px-1.5 py-0.5 text-xs font-medium', statusColor)}
        >
          {statusLabel}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'totalBudget',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Presupuesto' className='text-right' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('totalBudget') as number
      return (
        <div className='text-right text-xs font-semibold'>
          {formatCurrency(amount)}
        </div>
      )
    },
  },
  {
    accessorKey: 'paymentsReceived',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cobrado' className='text-right' />
    ),
    cell: ({ row }) => {
      const record = row.original
      return (
        <AmountCell
          amount={record.paymentsReceived}
          total={record.totalBudget}
          colorClass='text-green-600'
        />
      )
    },
  },
  {
    accessorKey: 'facturado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pdte. Cobro' className='text-right' />
    ),
    cell: ({ row }) => {
      const record = row.original
      return (
        <AmountCell
          amount={record.facturado}
          total={record.totalBudget}
          colorClass='text-blue-600'
        />
      )
    },
  },
  {
    accessorKey: 'pendiente_factura',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pdte. Fact.' className='text-right' />
    ),
    cell: ({ row }) => {
      const record = row.original
      return (
        <AmountCell
          amount={record.pendiente_factura}
          total={record.totalBudget}
          colorClass='text-amber-600'
        />
      )
    },
  },
  {
    accessorKey: 'unassigned',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sin Asig.' className='text-right' />
    ),
    cell: ({ row }) => {
      const record = row.original
      return (
        <AmountCell
          amount={record.unassigned}
          total={record.totalBudget}
          colorClass={record.unassigned >= 0 ? 'text-purple-600' : 'text-red-600'}
        />
      )
    },
  },
  {
    id: 'progress',
    header: () => <div>Progreso</div>,
    cell: ({ row }) => {
      return <FinancialProgressBar record={row.original} />
    },
  },
]
