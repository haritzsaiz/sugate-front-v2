import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter, DataTableViewOptions } from '@/components/data-table'
import { DateRangePicker } from '@/components/date-range-picker'
import { projectStatusLabels } from '@/features/proyectos/data/schema'
import type { FinancialRecord } from '../data/schema'

interface FinanzasToolbarProps {
  table: Table<FinancialRecord>
  dateRange: DateRange | undefined
  onDateRangeChange: (dateRange: DateRange | undefined) => void
  officeOptions: Array<{ label: string; value: string }>
}

const estadoOptions = Object.entries(projectStatusLabels).map(([value, label]) => ({
  label,
  value,
}))

export function FinanzasToolbar({
  table,
  dateRange,
  onDateRangeChange,
  officeOptions,
}: FinanzasToolbarProps) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Buscar por proyecto, cliente, oficina...'
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className='h-8 w-full sm:w-[300px] lg:w-[400px]'
        />
        <div className='flex gap-x-2'>
          <DateRangePicker
            date={dateRange}
            onDateChange={onDateRangeChange}
            className='h-8 w-[30%] min-w-[200px]'
            placeholder='Rango de fechas'
          />
          {table.getColumn('projectStatus') && (
            <DataTableFacetedFilter
              column={table.getColumn('projectStatus')}
              title='Estados'
              options={estadoOptions}
            />
          )}
          {table.getColumn('office') && officeOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn('office')}
              title='Oficinas'
              options={officeOptions}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
            }}
            className='h-8 px-2 lg:px-3'
          >
            Limpiar
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
