import { createFileRoute } from '@tanstack/react-router'
import { ProyectoEditForm } from '@/features/proyectos/components/proyecto-edit-form'

export const Route = createFileRoute('/_authenticated/proyectos/$proyectoId')({
  component: ProyectoEditForm,
})
