import { createFileRoute } from '@tanstack/react-router'
import { DetallesTab } from '@/features/proyectos/components/tabs/detalles-tab'

export const Route = createFileRoute('/_authenticated/proyectos/$proyectoId/detalles')({
  component: DetallesTab,
})
