import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { MapPin, Save, X, Loader2, Building, User, Mail, Phone, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { createProject } from '@/lib/project-service'
import { getClientById, type Client } from '@/lib/client-service'
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
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Search } from '@/components/search'
import { OficinaSelector } from '@/components/oficina-selector'
import { ClienteSelector } from '@/components/cliente-selector'

const formSchema = z.object({
  id_cliente: z.string().min(1, 'El cliente es requerido'),
  direccion: z.string().min(1, 'La dirección es requerida'),
  ciudad: z.string().min(1, 'La ciudad es requerida'),
  oficina: z.string().min(1, 'La oficina es requerida'),
})

type ProyectoFormData = z.infer<typeof formSchema>

export function ProyectoForm() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Client | null>(null)

  const form = useForm<ProyectoFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_cliente: '',
      direccion: '',
      ciudad: '',
      oficina: '',
    },
  })

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
                      <FormControl>
                        <ClienteSelector
                          value={field.value}
                          onValueChange={(value, cliente) => {
                            field.onChange(value)
                            setSelectedCliente(cliente)
                          }}
                          placeholder='Buscar cliente por nombre...'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Selected Client Details */}
                {selectedCliente && (
                  <Card className='mt-4 border-primary/20 bg-primary/5'>
                    <CardContent className='pt-4'>
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                        <div className='flex items-start gap-2'>
                          <User className='mt-0.5 h-4 w-4 text-muted-foreground' />
                          <div>
                            <p className='text-xs font-medium text-muted-foreground'>Nombre completo</p>
                            <p className='text-sm font-medium'>{selectedCliente.nombre_completo}</p>
                          </div>
                        </div>
                        <div className='flex items-start gap-2'>
                          <CreditCard className='mt-0.5 h-4 w-4 text-muted-foreground' />
                          <div>
                            <p className='text-xs font-medium text-muted-foreground'>DNI/NIE</p>
                            <p className='text-sm font-medium'>{selectedCliente.dni || '—'}</p>
                          </div>
                        </div>
                        <div className='flex items-start gap-2'>
                          <Mail className='mt-0.5 h-4 w-4 text-muted-foreground' />
                          <div>
                            <p className='text-xs font-medium text-muted-foreground'>Email</p>
                            <p className='text-sm font-medium'>{selectedCliente.email || '—'}</p>
                          </div>
                        </div>
                        <div className='flex items-start gap-2'>
                          <Phone className='mt-0.5 h-4 w-4 text-muted-foreground' />
                          <div>
                            <p className='text-xs font-medium text-muted-foreground'>Teléfono</p>
                            <p className='text-sm font-medium'>{selectedCliente.telefono || '—'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                      <FormLabel>
                        Oficina <span className='text-destructive'>*</span>
                      </FormLabel>
                      <FormControl>
                        <OficinaSelector
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                          placeholder='Seleccionar oficina...'
                        />
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
