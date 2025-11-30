import { createFileRoute } from '@tanstack/react-router'
import { AdminTab } from '@/features/proyectos/components/tabs/admin-tab'

export const Route = createFileRoute('/_authenticated/proyectos/$proyectoId/admin')({
  component: AdminTab,
})
