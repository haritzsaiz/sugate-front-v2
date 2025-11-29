import { z } from 'zod'

export const clienteSchema = z.object({
  _id: z.string(),
  dni: z.string().optional(),
  nombre: z.string(),
  apellido1: z.string(),
  apellido2: z.string().optional(),
  nombre_completo: z.string(),
  email: z.string(),
  telefono: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type Cliente = z.infer<typeof clienteSchema>
