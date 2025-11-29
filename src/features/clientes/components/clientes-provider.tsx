import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Cliente } from '../data/schema'

type ClientesDialogType = 'create' | 'update' | 'delete' | 'import'

type ClientesContextType = {
  open: ClientesDialogType | null
  setOpen: (str: ClientesDialogType | null) => void
  currentRow: Cliente | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Cliente | null>>
}

const ClientesContext = React.createContext<ClientesContextType | null>(null)

export function ClientesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ClientesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Cliente | null>(null)

  return (
    <ClientesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ClientesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useClientes = () => {
  const clientesContext = React.useContext(ClientesContext)

  if (!clientesContext) {
    throw new Error('useClientes has to be used within <ClientesContext>')
  }

  return clientesContext
}
