import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DatePickerProps = {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  disableFutureDates?: boolean
  disablePastDates?: boolean
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  className,
  disableFutureDates = false,
  disablePastDates = false,
}: DatePickerProps) {
  const getDisabledDates = (date: Date) => {
    if (disableFutureDates && date > new Date()) return true
    if (disablePastDates && date < new Date(new Date().setHours(0, 0, 0, 0))) return true
    if (date < new Date('1900-01-01')) return true
    return false
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          data-empty={!selected}
          className={cn(
            'w-full justify-start text-start font-normal',
            'data-[empty=true]:text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {selected ? (
            format(selected, "d 'de' MMMM 'de' yyyy", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          captionLayout='dropdown'
          selected={selected}
          onSelect={onSelect}
          disabled={getDisabledDates}
          locale={es}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
