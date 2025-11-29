import { type ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Cliente } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const clientesColumns: ColumnDef<Cliente>[] = [
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
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      const cliente = row.original
      return (
        <Link
          to='/clientes/$clienteId'
          params={{ clienteId: cliente._id }}
          className='font-medium text-blue-600 hover:underline'
        >
          {row.getValue('nombre')}
        </Link>
      )
    },
  },
  {
    id: 'apellidos',
    accessorFn: (row) => [row.apellido1, row.apellido2].filter(Boolean).join(' '),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Apellidos' />
    ),
    cell: ({ row }) => <div>{row.getValue('apellidos')}</div>,
  },
  {
    accessorKey: 'dni',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='DNI' />
    ),
    cell: ({ row }) => <div>{row.getValue('dni') || '-'}</div>,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Correo Electrónico' />
    ),
    cell: ({ row }) => <div>{row.getValue('email') || '-'}</div>,
  },
  {
    accessorKey: 'telefono',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono' />
    ),
    cell: ({ row }) => <div>{row.getValue('telefono') || '-'}</div>,
  },
  {
    id: 'actions',
    header: () => <div className='text-right'>Acciones</div>,
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
