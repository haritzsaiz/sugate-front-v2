import { createFileRoute } from '@tanstack/react-router'
import { Finanzas } from '@/features/finanzas'

export const Route = createFileRoute('/_authenticated/finanzas/')({
  component: Finanzas,
})
