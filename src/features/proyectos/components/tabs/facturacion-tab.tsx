import { BillingTab as BillingTabComponent } from '@/features/proyectos/components/billing'
import { useProyectoDetailContext } from '@/features/proyectos/hooks/use-proyecto-detail-context'

export function FacturacionTab() {
  const { proyecto, onProjectUpdate } = useProyectoDetailContext()

  return (
    <BillingTabComponent 
      project={proyecto} 
      onProjectUpdate={onProjectUpdate}
    />
  )
}
