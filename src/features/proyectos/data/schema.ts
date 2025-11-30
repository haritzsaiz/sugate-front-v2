import { z } from 'zod'

export const projectStatusSchema = z.enum([
  'presupuesto',
  'presupuesto_abandonado',
  'planificacion',
  'en_ejecucion',
  'finalizado',
  'cancelado',
])

export type ProjectStatus = z.infer<typeof projectStatusSchema>

export const projectStatusLabels: Record<ProjectStatus, string> = {
  presupuesto: 'Presupuestado',
  presupuesto_abandonado: 'Presupuesto Abandonado',
  planificacion: 'Planificación',
  en_ejecucion: 'En ejecución',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
}

export const projectStatusColors: Record<ProjectStatus, string> = {
  presupuesto: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  presupuesto_abandonado: 'bg-orange-100 text-orange-800 border-orange-200',
  planificacion: 'bg-blue-100 text-blue-800 border-blue-200',
  en_ejecucion: 'bg-green-100 text-green-800 border-green-200',
  finalizado: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelado: 'bg-red-100 text-red-800 border-red-200',
}

export const projectSchema = z.object({
  id: z.string(),
  id_cliente: z.string(),
  direccion: z.string(),
  ciudad: z.string(),
  oficina: z.string().optional(),
  estado: projectStatusSchema,
  budget_id_aprobado: z.string().optional(),
  prevision: z.object({
    fecha_inicio: z.string(),
    dias_ejecucion: z.number(),
  }),
  planificacion: z.object({
    fecha_inicio: z.string(),
  }),
  ejecucion: z.object({
    fecha_inicio: z.string(),
    fecha_fin: z.string(),
  }),
  fechas_cambio_estado: z.array(z.object({
    estado: projectStatusSchema,
    fecha: z.string(),
    nota: z.string().optional(),
  })),
  created_at: z.string(),
  updated_at: z.string(),
  presupuestos: z.array(z.object({
    id: z.string(),
    project_id: z.string(),
    nombre: z.string(),
    total: z.number(),
    estado: z.enum(['borrador', 'enviado', 'aprobado', 'rechazado']),
    created_at: z.string(),
    updated_at: z.string(),
  })).optional(),
  // Client info (populated from API or joined)
  cliente_nombre: z.string().optional(),
  // Oficina color (populated from oficinas)
  oficina_color: z.string().optional(),
})

export type Proyecto = z.infer<typeof projectSchema>
