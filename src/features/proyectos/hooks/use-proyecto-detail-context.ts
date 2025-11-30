import { createContext, useContext } from 'react'
import { type Project } from '@/lib/types'
import { type Client } from '@/lib/client-service'

export interface ProyectoDetailContextType {
  proyecto: Project
  cliente: Client | null
  onProjectUpdate: (updatedProject: Project) => void
}

export const ProyectoDetailContext = createContext<ProyectoDetailContextType | null>(null)

export function useProyectoDetailContext(): ProyectoDetailContextType {
  const context = useContext(ProyectoDetailContext)
  if (!context) {
    throw new Error('useProyectoDetailContext must be used within a ProyectoDetailProvider')
  }
  return context
}
