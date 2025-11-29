import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from '@tanstack/react-router'
import { z } from 'zod'
import { Mail, Save, User, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getClientById, updateClient, type Client } from '@/lib/client-service'
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
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Search } from '@/components/search'

const formSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido1: z.string().min(1, 'El primer apellido es requerido'),
  apellido2: z.string().optional(),
  dni: z.string().optional(),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
})

type ClienteFormData = z.infer<typeof formSchema>

export function ClienteEditForm() {
  const navigate = useNavigate()
  const { clienteId } = useParams({ from: '/_authenticated/clientes/$clienteId' })
  const [cliente, setCliente] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      apellido1: '',
      apellido2: '',
      dni: '',
      email: '',
      telefono: '',
    },
  })

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoading(true)
        const data = await getClientById(clienteId)
        if (data) {
          setCliente(data)
          form.reset({
            nombre: data.nombre,
            apellido1: data.apellido1,
            apellido2: data.apellido2 || '',
            dni: data.dni,
            email: data.email || '',
            telefono: data.telefono || '',
          })
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error al cargar el cliente')
      } finally {
        setLoading(false)
      }
    }

    fetchCliente()
  }, [clienteId, form])

  const onSubmit = async (data: ClienteFormData) => {
    if (!cliente) return

    try {
      setIsSubmitting(true)
      await updateClient({
        ...cliente,
        nombre: data.nombre,
        apellido1: data.apellido1,
        apellido2: data.apellido2,
        dni: data.dni,
        email: data.email || '',
        telefono: data.telefono,
      })
      toast.success('Cliente actualizado correctamente')
      navigate({ to: '/clientes' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate({ to: '/clientes' })
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
        <Main className='flex flex-1 flex-col items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          <p className='text-muted-foreground mt-2'>Cargando cliente...</p>
        </Main>
      </>
    )
  }

  if (!cliente) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className='flex flex-1 flex-col items-center justify-center'>
          <p className='text-muted-foreground'>Cliente no encontrado</p>
          <Button variant='outline' onClick={handleCancel} className='mt-4'>
            Volver a Clientes
          </Button>
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
            <h2 className='text-2xl font-bold tracking-tight'>Editar Cliente</h2>
            <p className='text-muted-foreground'>
              Actualiza los detalles del cliente.
            </p>
          </div>
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              className='gap-2'
              disabled={isSubmitting}
            >
              <X className='h-4 w-4' />
              Cancelar
            </Button>
            <Button
              type='submit'
              form='cliente-edit-form'
              className='gap-2'
              disabled={isSubmitting}
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
          <form id='cliente-edit-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {/* Información Personal */}
            <div className='rounded-lg border p-6'>
              <div className='mb-4 flex items-center gap-2'>
                <User className='h-5 w-5 text-primary' />
                <h3 className='text-lg font-medium'>Información Personal</h3>
              </div>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <FormField
                  control={form.control}
                  name='nombre'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre <span className='text-destructive'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Introduce el nombre' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='apellido1'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Primer Apellido <span className='text-destructive'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Introduce el primer apellido' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='apellido2'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segundo Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder='Introduce el segundo apellido (opcional)' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='dni'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI/NIE</FormLabel>
                      <FormControl>
                        <Input placeholder='12345678A (opcional)' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Información de Contacto */}
            <div className='rounded-lg border p-6'>
              <div className='mb-4 flex items-center gap-2'>
                <Mail className='h-5 w-5 text-primary' />
                <h3 className='text-lg font-medium'>Información de Contacto</h3>
              </div>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='lg:col-span-2'>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='ejemplo@correo.com (opcional)'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='telefono'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder='666123456' {...field} />
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
