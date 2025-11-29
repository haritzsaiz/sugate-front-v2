import { createFileRoute } from '@tanstack/react-router'
import { ProyectoForm } from '@/features/proyectos/components/proyecto-form'

export const Route = createFileRoute('/_authenticated/proyectos/nuevo')({
  component: ProyectoForm,
})
