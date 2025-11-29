import { useState, useEffect, useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { MapPin, Save, X, Loader2, Building, Check, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { createProject } from '@/lib/project-service'
import { getAllClients, getClientById, type Client } from '@/lib/client-service'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Search } from '@/components/search'

const formSchema = z.object({
  id_cliente: z.string().min(1, 'El cliente es requerido'),
  direccion: z.string().min(1, 'La dirección es requerida'),
  ciudad: z.string().min(1, 'La ciudad es requerida'),
  oficina: z.string().optional(),
})

type ProyectoFormData = z.infer<typeof formSchema>

export function ProyectoForm() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientes, setClientes] = useState<Client[]>([])
  const [selectedCliente, setSelectedCliente] = useState<Client | null>(null)
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [clienteOpen, setClienteOpen] = useState(false)
  const [clienteSearch, setClienteSearch] = useState('')

  const form = useForm<ProyectoFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_cliente: '',
      direccion: '',
      ciudad: '',
      oficina: '',
    },
  })

  // Debounced search for clients via API - searches multiple fields in parallel
  const searchClientes = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setClientes([])
      return
    }
    
    setLoadingClientes(true)
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
      setLoadingClientes(false)
    }
  }, [])

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchClientes(clienteSearch)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [clienteSearch, searchClientes])

  // Load selected client data if needed (for edit mode or when form has initial value)
  useEffect(() => {
    const clientId = form.getValues('id_cliente')
    if (clientId && !selectedCliente) {
      getClientById(clientId).then((client) => {
        if (client) {
          setSelectedCliente(client)
        }
      })
    }
  }, [form, selectedCliente])

  // Get selected client display name
  const getSelectedClientName = () => {
    return selectedCliente?.nombre_completo || ''
  }

  const onSubmit = async (data: ProyectoFormData) => {
    try {
      setIsSubmitting(true)
      await createProject({
        id_cliente: data.id_cliente,
        direccion: data.direccion,
        ciudad: data.ciudad,
        oficina: data.oficina,
      })
      toast.success('Proyecto creado correctamente')
      navigate({ to: '/proyectos' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear el proyecto')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate({ to: '/proyectos' })
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Page Header */}
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Nuevo Proyecto</h2>
            <p className='text-muted-foreground'>
              Introduce los detalles del nuevo proyecto para añadirlo al sistema.
            </p>
          </div>
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              className='gap-2'
            >
              <X className='h-4 w-4' />
              Cancelar
            </Button>
            <Button
              type='submit'
              form='proyecto-form'
              disabled={isSubmitting}
              className='gap-2'
            >
              {isSubmitting ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Save className='h-4 w-4' />
              )}
              Guardar Proyecto
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form id='proyecto-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Cliente */}
            <div>
              <div className='mb-4 flex items-center gap-2'>
                <Building className='h-5 w-5 text-primary' />
                <h3 className='text-lg font-medium'>Cliente</h3>
              </div>
              <div className='grid grid-cols-1 gap-4'>
                <FormField
                  control={form.control}
                  name='id_cliente'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>
                        Cliente <span className='text-destructive'>*</span>
                      </FormLabel>
                      <Popover open={clienteOpen} onOpenChange={setClienteOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              role='combobox'
                              aria-expanded={clienteOpen}
                              className={cn(
                                'w-full justify-between font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value
                                ? getSelectedClientName()
                                : 'Buscar cliente por nombre...'}
                              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-[400px] p-0' align='start'>
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder='Buscar por nombre, apellido, email, tlf, DNI...'
                              value={clienteSearch}
                              onValueChange={setClienteSearch}
                            />
                            <CommandList>
                              {loadingClientes && (
                                <div className='flex items-center justify-center py-6'>
                                  <Loader2 className='h-4 w-4 animate-spin' />
                                  <span className='ml-2 text-sm text-muted-foreground'>Buscando...</span>
                                </div>
                              )}
                              {!loadingClientes && clienteSearch.trim() && clientes.length === 0 && (
                                <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                              )}
                              {!loadingClientes && !clienteSearch.trim() && (
                                <div className='py-6 text-center text-sm text-muted-foreground'>
                                  Escribe para buscar clientes...
                                </div>
                              )}
                              {!loadingClientes && clientes.length > 0 && (
                                <CommandGroup>
                                  {clientes.map((cliente) => (
                                    <CommandItem
                                      key={cliente._id}
                                      value={cliente._id}
                                      onSelect={() => {
                                        field.onChange(cliente._id)
                                        setSelectedCliente(cliente)
                                        setClienteOpen(false)
                                        setClienteSearch('')
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          field.value === cliente._id ? 'opacity-100' : 'opacity-0'
                                        )}
                                      />
                                      <div className='flex flex-col'>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <div className='mb-4 flex items-center gap-2'>
                <MapPin className='h-5 w-5 text-primary' />
                <h3 className='text-lg font-medium'>Ubicación del Proyecto</h3>
              </div>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <FormField
                  control={form.control}
                  name='direccion'
                  render={({ field }) => (
                    <FormItem className='lg:col-span-2'>
                      <FormLabel>
                        Dirección <span className='text-destructive'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Calle, número, piso...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='ciudad'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ciudad <span className='text-destructive'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Ciudad' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='oficina'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oficina</FormLabel>
                      <FormControl>
                        <Input placeholder='Oficina (opcional)' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </Main>
    </>
  )
}
