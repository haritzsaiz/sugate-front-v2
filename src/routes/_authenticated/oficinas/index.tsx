import { createFileRoute } from '@tanstack/react-router'
import { Oficinas } from '@/features/oficinas'

export const Route = createFileRoute('/_authenticated/oficinas/')({
  component: Oficinas,
})
