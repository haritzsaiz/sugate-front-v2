import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Mail, Save, User, UserPlus, X } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { type Cliente } from '../data/schema'

const formSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido1: z.string().min(1, 'El primer apellido es requerido'),
  apellido2: z.string().optional(),
  dni: z.string().optional(),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
})

type ClienteForm = z.infer<typeof formSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Cliente
}

export function ClientesMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow

  const form = useForm<ClienteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? {
          nombre: currentRow.nombre,
          apellido1: currentRow.apellido1 || '',
          apellido2: currentRow.apellido2 || '',
          dni: currentRow.dni || '',
          email: currentRow.email || '',
          telefono: currentRow.telefono || '',
        }
      : {
          nombre: '',
          apellido1: '',
          apellido2: '',
          dni: '',
          email: '',
          telefono: '',
        },
  })

  const onSubmit = (data: ClienteForm) => {
    const submitData = {
      ...data,
    }
    showSubmittedData(submitData, isUpdate ? 'Cliente actualizado:' : 'Cliente creado:')
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader className='flex flex-row items-start gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600'>
            <UserPlus className='h-6 w-6 text-white' />
          </div>
          <div className='flex-1'>
            <DialogTitle className='text-xl'>
              {isUpdate ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
            </DialogTitle>
            <DialogDescription>
              {isUpdate
                ? 'Actualiza los detalles del cliente.'
                : 'Introduce los detalles del nuevo cliente para añadirlo al sistema.'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            id='cliente-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            {/* Información Personal */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2 text-sm font-medium'>
                <User className='h-4 w-4 text-muted-foreground' />
                <span>Información Personal</span>
              </div>
              <div className='grid grid-cols-2 gap-4'>
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
            <div className='space-y-4'>
              <div className='flex items-center gap-2 text-sm font-medium'>
                <Mail className='h-4 w-4 text-muted-foreground' />
                <span>Información de Contacto</span>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
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

            {/* Buttons */}
            <div className='flex gap-3 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                className='gap-2'
              >
                <X className='h-4 w-4' />
                Cancelar
              </Button>
              <Button
                type='submit'
                className='gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              >
                <Save className='h-4 w-4' />
                {isUpdate ? 'Guardar Cambios' : 'Crear Cliente'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
