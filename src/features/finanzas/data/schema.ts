import { z } from 'zod'
import { projectStatusSchema } from '@/features/proyectos/data/schema'

export const financialRecordSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  office: z.string(),
  projectStatus: projectStatusSchema,
  createdAt: z.string(),
  totalBudget: z.number(),
  paymentsReceived: z.number(),
  facturado: z.number(),
  pendiente_factura: z.number(),
  unassigned: z.number(),
})

export type FinancialRecord = z.infer<typeof financialRecordSchema>

// Re-export for convenience
export { projectStatusLabels, projectStatusColors } from '@/features/proyectos/data/schema'
export type { ProjectStatus } from '@/features/proyectos/data/schema'
