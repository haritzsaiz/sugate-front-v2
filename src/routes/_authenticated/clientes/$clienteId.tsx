import { createFileRoute } from '@tanstack/react-router'
import { ClienteEditForm } from '@/features/clientes/components/cliente-edit-form'

export const Route = createFileRoute('/_authenticated/clientes/$clienteId')({
  component: ClienteEditForm,
})
