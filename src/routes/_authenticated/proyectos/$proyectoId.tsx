import { createFileRoute } from '@tanstack/react-router'
import { ProyectoDetail } from '@/features/proyectos/components/proyecto-detail'

export const Route = createFileRoute('/_authenticated/proyectos/$proyectoId')({
  component: ProyectoDetail,
})
