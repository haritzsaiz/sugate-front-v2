import * as React from 'react'
import { useMemo, useImperativeHandle, forwardRef } from 'react'
import type { DateRange } from 'react-day-picker'
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Table as TableType,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { DataTablePagination, DataTableLoadingProgress } from '@/components/data-table'
import type { FinancialRecord } from '../data/schema'
import { finanzasColumns as columns } from './finanzas-columns'
import { FinanzasToolbar } from './finanzas-toolbar'
import { formatCurrency } from './financial-progress-bar'

type FinanzasTableProps = {
  data: FinancialRecord[]
  isLoading?: boolean
  dateRange: DateRange | undefined
  onDateRangeChange: (dateRange: DateRange | undefined) => void
  officeOptions: Array<{ label: string; value: string }>
}

// Expose table methods for parent access
export interface FinanzasTableRef {
  getSelectedRows: () => FinancialRecord[]
  getFilteredRows: () => FinancialRecord[]
  getTable: () => TableType<FinancialRecord>
}

export const FinanzasTable = forwardRef<FinanzasTableRef, FinanzasTableProps>(
  function FinanzasTable(
    {
      data,
      isLoading,
      dateRange,
      onDateRangeChange,
      officeOptions,
    },
    ref
  ) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = React.useState({})
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: (row, _columnId, filterValue) => {
      const projectName = String(row.getValue('projectName')).toLowerCase()
      const clientName = String(row.original.clientName || '').toLowerCase()
      const office = String(row.getValue('office') || '').toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return (
        projectName.includes(searchValue) ||
        clientName.includes(searchValue) ||
        office.includes(searchValue)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getSelectedRows: () => {
      const selectedRowModels = table.getSelectedRowModel().rows
      return selectedRowModels.map((row) => row.original)
    },
    getFilteredRows: () => {
      const filteredRowModels = table.getFilteredRowModel().rows
      return filteredRowModels.map((row) => row.original)
    },
    getTable: () => table,
  }))

  // Calculate totals from filtered rows
  const totals = useMemo(() => {
    const filteredRows = table.getFilteredRowModel().rows
    return filteredRows.reduce(
      (acc, row) => {
        const record = row.original
        acc.totalBudget += record.totalBudget
        acc.paymentsReceived += record.paymentsReceived
        acc.facturado += record.facturado
        acc.pendiente_factura += record.pendiente_factura
        acc.unassigned += record.unassigned
        return acc
      },
      {
        totalBudget: 0,
        paymentsReceived: 0,
        facturado: 0,
        pendiente_factura: 0,
        unassigned: 0,
      }
    )
  }, [table.getFilteredRowModel().rows])

  return (
    <div className='space-y-4'>
      <FinanzasToolbar
        table={table}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        officeOptions={officeOptions}
      />
      
      {/* Legend */}
      <div className='flex flex-wrap items-center gap-4 text-xs'>
        <span className='text-muted-foreground'>Leyenda:</span>
        <div className='flex items-center gap-1.5'>
          <div className='h-3 w-3 rounded-sm bg-green-500' />
          <span>Cobrado</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div className='h-3 w-3 rounded-sm bg-blue-500' />
          <span>Pdte. Cobro</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div className='h-3 w-3 rounded-sm bg-amber-400' />
          <span>Pdte. Factura</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div className='h-3 w-3 rounded-sm bg-purple-400' />
          <span>Sin Asignar</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div className='h-3 w-3 rounded-sm bg-red-500' />
          <span>Exceso</span>
        </div>
      </div>

      <div className='rounded-md border'>
        <Table className='table-fixed'>
          <colgroup>
            <col className='w-10' />
          </colgroup>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      header.column.id === 'totalBudget' ||
                        header.column.id === 'paymentsReceived' ||
                        header.column.id === 'facturado' ||
                        header.column.id === 'pendiente_factura' ||
                        header.column.id === 'unassigned'
                        ? 'text-right'
                        : ''
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
            <DataTableLoadingProgress
              isLoading={isLoading}
              colSpan={columns.length}
            />
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.id === 'totalBudget' ||
                          cell.column.id === 'paymentsReceived' ||
                          cell.column.id === 'facturado' ||
                          cell.column.id === 'pendiente_factura' ||
                          cell.column.id === 'unassigned'
                          ? 'text-right'
                          : ''
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No se encontraron registros financieros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {table.getFilteredRowModel().rows.length > 0 && (
            <TableFooter className='bg-muted/50'>
              <TableRow>
                {table.getVisibleLeafColumns().map((column, index) => {
                  // First visible column shows the totals label
                  if (index === 0) {
                    return (
                      <TableCell key={column.id} className='font-semibold'>
                        Totales ({table.getFilteredRowModel().rows.length} registros)
                      </TableCell>
                    )
                  }

                  // Render appropriate total based on column id
                  switch (column.id) {
                    case 'totalBudget':
                      return (
                        <TableCell key={column.id} className='text-right font-semibold'>
                          {formatCurrency(totals.totalBudget)}
                        </TableCell>
                      )
                    case 'paymentsReceived':
                      return (
                        <TableCell key={column.id} className='text-right font-semibold text-green-600'>
                          {formatCurrency(totals.paymentsReceived)}
                        </TableCell>
                      )
                    case 'facturado':
                      return (
                        <TableCell key={column.id} className='text-right font-semibold text-blue-600'>
                          {formatCurrency(totals.facturado)}
                        </TableCell>
                      )
                    case 'pendiente_factura':
                      return (
                        <TableCell key={column.id} className='text-right font-semibold text-amber-600'>
                          {formatCurrency(totals.pendiente_factura)}
                        </TableCell>
                      )
                    case 'unassigned':
                      return (
                        <TableCell
                          key={column.id}
                          className={cn(
                            'text-right font-semibold',
                            totals.unassigned >= 0 ? 'text-purple-600' : 'text-red-600'
                          )}
                        >
                          {formatCurrency(totals.unassigned)}
                        </TableCell>
                      )
                    default:
                      // Empty cell for non-numeric columns
                      return <TableCell key={column.id} />
                  }
                })}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
})
