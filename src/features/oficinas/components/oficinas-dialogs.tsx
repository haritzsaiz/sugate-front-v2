import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { createOficina, updateOficina, deleteOficina } from '@/lib/oficina-service'
import { useOficinas } from './oficinas-provider'

const formSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  color: z.string().optional(),
})

type OficinaFormData = z.infer<typeof formSchema>

interface OficinasDialogsProps {
  onRefresh: () => void
}

export function OficinasDialogs({ onRefresh }: OficinasDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useOficinas()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<OficinaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: currentRow?.nombre || '',
      direccion: currentRow?.direccion || '',
      telefono: currentRow?.telefono || '',
      email: currentRow?.email || '',
      color: currentRow?.color || '',
    },
  })

  // Reset form when dialog opens with currentRow data
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(null)
      setTimeout(() => {
        setCurrentRow(null)
        form.reset({
          nombre: '',
          direccion: '',
          telefono: '',
          email: '',
          color: '',
        })
      }, 300)
    }
  }

  // Update form values when currentRow changes for edit mode
  const isEditMode = open === 'update' && currentRow
  if (isEditMode && form.getValues('nombre') !== currentRow.nombre) {
    form.reset({
      nombre: currentRow.nombre,
      direccion: currentRow.direccion || '',
      telefono: currentRow.telefono || '',
      email: currentRow.email || '',
      color: currentRow.color || '',
    })
  }

  const onSubmit = async (data: OficinaFormData) => {
    try {
      setIsSubmitting(true)
      if (isEditMode) {
        await updateOficina({
          ...currentRow,
          nombre: data.nombre,
          direccion: data.direccion,
          telefono: data.telefono,
          email: data.email || '',
          color: data.color,
        })
        toast.success('Oficina actualizada correctamente')
      } else {
        await createOficina({
          id: crypto.randomUUID(),
          nombre: data.nombre,
          direccion: data.direccion,
          telefono: data.telefono,
          email: data.email || '',
          color: data.color,
        })
        toast.success('Oficina creada correctamente')
      }
      handleOpenChange(false)
      onRefresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEditMode
            ? 'Error al actualizar la oficina'
            : 'Error al crear la oficina'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!currentRow) return
    try {
      setIsSubmitting(true)
      await deleteOficina(currentRow.id)
      toast.success('Oficina eliminada correctamente')
      handleOpenChange(false)
      onRefresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al eliminar la oficina'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Create/Edit Dialog */}
      <Dialog open={open === 'create' || open === 'update'} onOpenChange={handleOpenChange}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editar Oficina' : 'Nueva Oficina'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Actualiza los datos de la oficina.'
                : 'Introduce los datos de la nueva oficina.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id='oficina-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
              autoComplete='off'
            >
              <FormField
                control={form.control}
                name='nombre'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nombre <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nombre de la oficina'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='direccion'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Dirección de la oficina (opcional)'
                        autoComplete='off'
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
                      <Input
                        placeholder='Teléfono de contacto (opcional)'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='correo@ejemplo.com (opcional)'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='color'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className='flex gap-2'>
                        <Input
                          type='color'
                          className='h-10 w-14 cursor-pointer p-1'
                          value={field.value || '#6366f1'}
                          onChange={field.onChange}
                        />
                        <Input
                          placeholder='#6366f1 (opcional)'
                          autoComplete='off'
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type='submit' form='oficina-form' disabled={isSubmitting}>
              {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isEditMode ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {currentRow && (
        <ConfirmDialog
          key='oficina-delete'
          destructive
          open={open === 'delete'}
          onOpenChange={() => handleOpenChange(false)}
          handleConfirm={handleDelete}
          className='max-w-md'
          title={`¿Eliminar oficina: ${currentRow.nombre}?`}
          desc={
            <>
              Estás a punto de eliminar la oficina{' '}
              <strong>{currentRow.nombre}</strong>. <br />
              Esta acción no se puede deshacer.
            </>
          }
          confirmText='Eliminar'
          isLoading={isSubmitting}
        />
      )}
    </>
  )
}
