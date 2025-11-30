import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { Oficina } from '@/lib/types'

type OficinasDialogType = 'create' | 'update' | 'delete'

type OficinasContextType = {
  open: OficinasDialogType | null
  setOpen: (str: OficinasDialogType | null) => void
  currentRow: Oficina | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Oficina | null>>
}

const OficinasContext = React.createContext<OficinasContextType | null>(null)

export function OficinasProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<OficinasDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Oficina | null>(null)

  return (
    <OficinasContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </OficinasContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOficinas = () => {
  const oficinasContext = React.useContext(OficinasContext)

  if (!oficinasContext) {
    throw new Error('useOficinas has to be used within <OficinasContext>')
  }

  return oficinasContext
}
