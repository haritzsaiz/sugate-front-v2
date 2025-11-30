import { createFileRoute } from '@tanstack/react-router'
import { PresupuestoTab } from '@/features/proyectos/components/tabs/presupuesto-tab'

export const Route = createFileRoute('/_authenticated/proyectos/$proyectoId/presupuesto')({
  component: PresupuestoTab,
})
