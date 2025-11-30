import { createFileRoute } from '@tanstack/react-router'
import { FacturacionTab } from '@/features/proyectos/components/tabs/facturacion-tab'

export const Route = createFileRoute('/_authenticated/proyectos/$proyectoId/facturacion')({
  component: FacturacionTab,
})
