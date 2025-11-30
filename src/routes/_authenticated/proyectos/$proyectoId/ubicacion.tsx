import { createFileRoute } from '@tanstack/react-router'
import { UbicacionTab } from '@/features/proyectos/components/tabs/ubicacion-tab'

export const Route = createFileRoute('/_authenticated/proyectos/$proyectoId/ubicacion')({
  component: UbicacionTab,
})
