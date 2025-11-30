import { createFileRoute } from '@tanstack/react-router'
import { ResumenTab } from '@/features/proyectos/components/tabs/resumen-tab'

export const Route = createFileRoute('/_authenticated/proyectos/$proyectoId/resumen')({
  component: ResumenTab,
})
