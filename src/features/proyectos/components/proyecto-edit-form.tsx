import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from '@tanstack/react-router'
import { z } from 'zod'
import { MapPin, Save, X, Loader2, Building, AlertCircle, User, Mail, Phone, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { getProjectById, updateProject } from '@/lib/project-service'
import { getAllClients, type Client } from '@/lib/client-service'
import { type Project } from '@/lib/types'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
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

export function ProyectoEditForm() {
  const navigate = useNavigate()
  const { proyectoId } = useParams({ from: '/_authenticated/proyectos/$proyectoId' })
  const [proyecto, setProyecto] = useState<Project | null>(null)
  const [clientes, setClientes] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProyectoFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_cliente: '',
      direccion: '',
      ciudad: '',
      oficina: '',
    },
  })

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getAllClients()
        setClientes(data)
      } catch (error) {
        toast.error('Error al cargar clientes')
      } finally {
        setLoadingClientes(false)
      }
    }
    fetchClientes()
  }, [])

  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        setLoading(true)
        const data = await getProjectById(proyectoId)
        if (data) {
          setProyecto(data)
          form.reset({
            id_cliente: data.id_cliente,
            direccion: data.direccion,
            ciudad: data.ciudad,
            oficina: data.oficina || '',
          })
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error al cargar el proyecto')
      } finally {
        setLoading(false)
      }
    }

    fetchProyecto()
  }, [proyectoId, form])

  const onSubmit = async (data: ProyectoFormData) => {
    if (!proyecto) return

    try {
      setIsSubmitting(true)
      await updateProject({
        ...proyecto,
        id_cliente: data.id_cliente,
        direccion: data.direccion,
        ciudad: data.ciudad,
        oficina: data.oficina,
      })
      toast.success('Proyecto actualizado correctamente')
      navigate({ to: '/proyectos' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el proyecto')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate({ to: '/proyectos' })
  }

  if (loading) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className='flex flex-1 items-center justify-center'>
          <div className='flex items-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span>Cargando proyecto...</span>
          </div>
        </Main>
      </>
    )
  }

  if (!proyecto) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className='flex flex-1 items-center justify-center'>
          <div className='flex flex-col items-center gap-4'>
            <AlertCircle className='h-12 w-12 text-destructive' />
            <p className='text-lg font-medium'>Proyecto no encontrado</p>
            <Button onClick={() => navigate({ to: '/proyectos' })}>
              Volver a proyectos
            </Button>
          </div>
        </Main>
      </>
    )
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
            <h2 className='text-2xl font-bold tracking-tight'>Editar Proyecto</h2>
            <p className='text-muted-foreground'>
              Modifica los detalles del proyecto.
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
              form='proyecto-edit-form'
              disabled={isSubmitting}
              className='gap-2'
            >
              {isSubmitting ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Save className='h-4 w-4' />
              )}
              Guardar Cambios
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form id='proyecto-edit-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {/* Cliente */}
            <div className='rounded-lg border p-6'>
              <div className='mb-4 flex items-center gap-2'>
                <Building className='h-5 w-5 text-primary' />
                <h3 className='text-lg font-medium'>Cliente</h3>
              </div>
              <div className='grid grid-cols-1 gap-4'>
                <FormField
                  control={form.control}
                  name='id_cliente'
                  render={({ field }) => {
                    const selectedCliente = clientes.find(c => c._id === field.value)
                    return (
                      <FormItem>
                        <FormLabel>
                          Cliente <span className='text-destructive'>*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingClientes ? 'Cargando clientes...' : 'Selecciona un cliente'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clientes.map((cliente) => (
                              <SelectItem key={cliente._id} value={cliente._id}>
                                {cliente.nombre_completo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />

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
                      </FormItem>
                    )
                  }}
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className='rounded-lg border p-6'>
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
