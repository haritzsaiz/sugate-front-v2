import { type BudgetData } from '@/lib/types'
import { updateProject } from '@/lib/project-service'
import { BudgetEditor } from '@/features/proyectos/components/budget'
import { useProyectoDetailContext } from '@/features/proyectos/hooks/use-proyecto-detail-context'
import { toast } from 'sonner'

export function PresupuestoTab() {
  const { proyecto, cliente, onProjectUpdate } = useProyectoDetailContext()

  return (
    <BudgetEditor
      project={proyecto}
      client={cliente}
      onSaveBudgetDetails={async (budgetData: BudgetData) => {
        try {
          // Add the new budget to the project's presupuestos array
          const newPresupuestos = [...(proyecto.presupuestos || []), budgetData]
          const updatedProject = { ...proyecto, presupuestos: newPresupuestos }
          
          const savedProject = await updateProject(updatedProject)
          onProjectUpdate(savedProject)
          
          console.log('Budget saved to project:', savedProject)
          toast.success('Presupuesto guardado correctamente')
        } catch (error) {
          console.error('Error saving budget:', error)
          toast.error('Error al guardar el presupuesto')
        }
      }}
    />
  )
}
