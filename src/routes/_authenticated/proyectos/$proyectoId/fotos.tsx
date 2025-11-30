import { createFileRoute } from '@tanstack/react-router'
import { FotosTab } from '@/features/proyectos/components/tabs/fotos-tab'

export const Route = createFileRoute('/_authenticated/proyectos/$proyectoId/fotos')({
  component: FotosTab,
})
