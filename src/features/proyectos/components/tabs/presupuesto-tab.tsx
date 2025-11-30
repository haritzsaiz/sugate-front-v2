import { type BudgetData, type Billing } from '@/lib/types'
import { getBillingByProjectId, createBilling, updateBilling } from '@/lib/billing-service'
import { BudgetEditor } from '@/features/proyectos/components/budget'
import { useProyectoDetailContext } from '@/features/proyectos/hooks/use-proyecto-detail-context'
import { toast } from 'sonner'

export function PresupuestoTab() {
  const { proyecto, cliente } = useProyectoDetailContext()

  return (
    <BudgetEditor
      project={proyecto}
      client={cliente}
      onSaveBudgetDetails={async (budgetData: BudgetData) => {
        try {
          // Check if billing already exists for this project
          const existingBilling = await getBillingByProjectId(proyecto.id)
          
          if (existingBilling) {
            // Update existing billing
            const updatedBilling: Billing = {
              ...existingBilling,
              presupuesto: budgetData,
              updated_at: new Date().toISOString(),
            }
            await updateBilling(updatedBilling)
            console.log('Updated billing:', updatedBilling)
          } else {
            // Create new billing
            const newBilling = {
              id_proyecto: proyecto.id,
              presupuesto: budgetData,
              hitos_facturacion: [],
            }
            const created = await createBilling(newBilling)
            console.log('Created billing:', created)
          }
          
          toast.success('Presupuesto guardado correctamente')
        } catch (error) {
          console.error('Error saving budget:', error)
          toast.error('Error al guardar el presupuesto')
        }
      }}
    />
  )
}
