import { useState, useEffect } from 'react'
import { Building2, Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { getAllOficinas, type Oficina } from '@/lib/oficina-service'

interface OficinaSelectorProps {
  value?: string
  onValueChange: (value: string, oficina: Oficina | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

function isSugateOficina(nombre: string): boolean {
  return nombre.toLowerCase().includes('sugate')
}

// Helper to create a lighter version of a hex color
function getLighterColor(hex: string, opacity: number = 0.2): string {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function OficinaSelector({
  value,
  onValueChange,
  placeholder = 'Seleccionar oficina...',
  disabled = false,
  className,
}: OficinaSelectorProps) {
  const [open, setOpen] = useState(false)
  const [oficinas, setOficinas] = useState<Oficina[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOficina, setSelectedOficina] = useState<Oficina | null>(null)

  // Load oficinas on mount
  useEffect(() => {
    const fetchOficinas = async () => {
      setLoading(true)
      try {
        const data = await getAllOficinas()
        setOficinas(data)
        // If there's a value, find the matching oficina
        if (value) {
          const found = data.find((o) => o.id === value || o.nombre === value)
          if (found) {
            setSelectedOficina(found)
          }
        }
      } catch (error) {
        console.error('Error loading oficinas:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOficinas()
  }, [value])

  const handleSelect = (oficina: Oficina) => {
    setSelectedOficina(oficina)
    onValueChange(oficina.nombre, oficina)
    setOpen(false)
  }

  const renderOficinaIcon = (oficina: Oficina) => {
    const isSugate = isSugateOficina(oficina.nombre)

    if (isSugate) {
      return (
        <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary'>
          <img
            src='/images/sugate.png'
            alt='Sugate Logo'
            className='h-6 w-6 object-contain'
          />
        </div>
      )
    }

    if (oficina.color) {
      return (
        <div
          className='flex h-8 w-8 items-center justify-center rounded-md'
          style={{ backgroundColor: getLighterColor(oficina.color, 0.2) }}
        >
          <Building2 className='h-4 w-4' style={{ color: oficina.color }} />
        </div>
      )
    }

    return (
      <div className='flex h-8 w-8 items-center justify-center rounded-md bg-muted'>
        <Building2 className='h-4 w-4 text-muted-foreground' />
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn('h-12 w-full justify-between font-normal', className)}
        >
          {loading ? (
            <div className='flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span className='text-muted-foreground'>Cargando oficinas...</span>
            </div>
          ) : selectedOficina ? (
            <div className='flex items-center gap-2'>
              {renderOficinaIcon(selectedOficina)}
              <span>{selectedOficina.nombre}</span>
            </div>
          ) : (
            <span className='text-muted-foreground'>{placeholder}</span>
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[350px] p-0' align='start'>
        <Command>
          <CommandList>
            {loading && (
              <div className='flex items-center justify-center py-6'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='ml-2 text-sm text-muted-foreground'>
                  Cargando...
                </span>
              </div>
            )}
            {!loading && oficinas.length === 0 && (
              <CommandEmpty>No hay oficinas disponibles.</CommandEmpty>
            )}
            {!loading && oficinas.length > 0 && (
              <CommandGroup>
                {oficinas.map((oficina) => (
                  <CommandItem
                    key={oficina.id}
                    value={oficina.nombre}
                    onSelect={() => handleSelect(oficina)}
                  >
                    {renderOficinaIcon(oficina)}
                    <div className='ml-2 flex flex-col'>
                      <span className='font-medium'>{oficina.nombre}</span>
                      {oficina.direccion && (
                        <span className='text-xs text-muted-foreground'>
                          {oficina.direccion}
                        </span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        selectedOficina?.id === oficina.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
