import type { Oficina } from './types'
import { makeRequest, ApiError } from './api-service'

export type { Oficina }

export const getAllOficinas = (): Promise<Oficina[]> => {
  return makeRequest<Oficina[]>('/oficinas/v1')
}

export const getOficinaById = async (id: string): Promise<Oficina | null> => {
  try {
    return await makeRequest<Oficina>(`/oficinas/v1/${encodeURIComponent(id)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

export const createOficina = (oficinaData: Omit<Oficina, 'created_at' | 'updated_at'>): Promise<Oficina> => {
  return makeRequest<Oficina>('/oficinas/v1', {
    method: 'POST',
    body: JSON.stringify(oficinaData),
  })
}

export const updateOficina = (oficinaData: Oficina): Promise<Oficina> => {
  return makeRequest<Oficina>('/oficinas/v1', {
    method: 'PUT',
    body: JSON.stringify(oficinaData),
  })
}

export const deleteOficina = (id: string): Promise<void> => {
  return makeRequest<void>(`/oficinas/v1/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export { ApiError }
