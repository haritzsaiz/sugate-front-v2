import { useState, useEffect, useCallback } from 'react'
import { Check, ChevronsUpDown, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { getAllClients, getClientById, type Client } from '@/lib/client-service'

interface ClienteSelectorProps {
  value?: string
  onValueChange: (value: string, cliente: Client | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ClienteSelector({
  value,
  onValueChange,
  placeholder = 'Buscar cliente por nombre...',
  disabled = false,
  className,
}: ClienteSelectorProps) {
  const [open, setOpen] = useState(false)
  const [clientes, setClientes] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Client | null>(null)
  const [search, setSearch] = useState('')

  // Load selected client if value is provided
  useEffect(() => {
    if (value && !selectedCliente) {
      getClientById(value).then((client) => {
        if (client) {
          setSelectedCliente(client)
        }
      })
    }
  }, [value, selectedCliente])

  // Debounced search for clients via API - searches multiple fields in parallel
  const searchClientes = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setClientes([])
      return
    }
    
    setLoading(true)
    try {
      // Search across multiple fields in parallel
      const searchFields = ['nombre_completo', 'dni', 'email', 'telefono']
      const searchPromises = searchFields.map((field) =>
        getAllClients({ 
          field, 
          value: searchTerm, 
          operand: 'contains' 
        }).catch(() => [] as Client[]) // Return empty array on error for individual field
      )
      
      const results = await Promise.all(searchPromises)
      
      // Flatten results and remove duplicates by _id
      const allClients = results.flat()
      const uniqueClients = Array.from(
        new Map(allClients.map((client) => [client._id, client])).values()
      )
      
      setClientes(uniqueClients)
    } catch (error) {
      console.error('Error searching clients:', error)
      setClientes([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchClientes(search)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [search, searchClientes])

  const handleSelect = (cliente: Client) => {
    setSelectedCliente(cliente)
    onValueChange(cliente._id, cliente)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn('h-12 w-full justify-between font-normal', className)}
        >
          {selectedCliente ? (
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-muted'>
                <User className='h-4 w-4 text-muted-foreground' />
              </div>
              <span>{selectedCliente.nombre_completo}</span>
            </div>
          ) : (
            <span className='text-muted-foreground'>{placeholder}</span>
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[400px] p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Buscar por nombre, apellido, email, tlf, DNI...'
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading && (
              <div className='flex items-center justify-center py-6'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='ml-2 text-sm text-muted-foreground'>Buscando...</span>
              </div>
            )}
            {!loading && search.trim() && clientes.length === 0 && (
              <CommandEmpty>No se encontraron clientes.</CommandEmpty>
            )}
            {!loading && !search.trim() && (
              <div className='py-6 text-center text-sm text-muted-foreground'>
                Escribe para buscar clientes...
              </div>
            )}
            {!loading && clientes.length > 0 && (
              <CommandGroup>
                {clientes.map((cliente) => (
                  <CommandItem
                    key={cliente._id}
                    value={cliente._id}
                    onSelect={() => handleSelect(cliente)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedCliente?._id === cliente._id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className='flex h-8 w-8 items-center justify-center rounded-md bg-muted'>
                      <User className='h-4 w-4 text-muted-foreground' />
                    </div>
                    <div className='ml-2 flex flex-col'>
                      <span className='font-medium'>{cliente.nombre_completo}</span>
                      <span className='text-xs text-muted-foreground'>
                        {[cliente.email, cliente.telefono, cliente.dni]
                          .filter(Boolean)
                          .join(' • ')}
                      </span>
                    </div>
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
