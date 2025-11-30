import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DateRangePickerProps = {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DateRangePicker({
  date,
  onDateChange,
  placeholder = 'Seleccionar rango',
  disabled = false,
  className,
}: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          data-empty={!date?.from}
          className={cn(
            'w-full justify-start text-start font-normal',
            'data-[empty=true]:text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'dd/MM/yy', { locale: es })} -{' '}
                {format(date.to, 'dd/MM/yy', { locale: es })}
              </>
            ) : (
              format(date.from, 'dd/MM/yy', { locale: es })
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='range'
          captionLayout='dropdown'
          selected={date}
          onSelect={onDateChange}
          numberOfMonths={2}
          locale={es}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
