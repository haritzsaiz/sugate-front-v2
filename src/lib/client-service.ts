// Client-specific service extending the core ApiService
import { makeRequest, ApiError } from '@/lib/api-service'

export interface Client {
  _id: string
  dni?: string
  nombre: string
  apellido1: string
  apellido2?: string
  nombre_completo: string
  email: string
  telefono?: string
  created_at?: string
  updated_at?: string
}

export type CreateClientData = Omit<Client, 'created_at' | 'updated_at' | 'nombre_completo' | '_id'>

export type UpdateClientData = Client

// Core CRUD operations
export const getAllClients = (
  filter?: { field: string; value: string; operand?: string }
): Promise<Client[]> => {
  let url = '/clientes/v1'
  if (filter && filter.field && filter.value) {
    const operand = filter.operand || 'eq'
    url += `?filter=${`${filter.field}[${operand}]${filter.value}`}`
  }
  return makeRequest<Client[]>(url)
}

export const getClientById = async (id: string): Promise<Client | null> => {
  try {
    return await makeRequest<Client>(`/clientes/v1/id/${encodeURIComponent(id)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

export const getClientByDni = async (dni: string): Promise<Client | null> => {
  try {
    return await makeRequest<Client>(`/clientes/v1/${encodeURIComponent(dni)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

export const createClient = (clientData: CreateClientData): Promise<Client> => {
  return makeRequest<Client>('/clientes/v1', {
    method: 'POST',
    body: JSON.stringify(clientData),
  })
}

export const updateClient = (clientData: UpdateClientData): Promise<Client> => {
  return makeRequest<Client>(`/clientes/v1/id/${encodeURIComponent(clientData._id)}`, {
    method: 'PUT',
    body: JSON.stringify(clientData),
  })
}

export const deleteClient = (id: string): Promise<void> => {
  return makeRequest<void>(`/clientes/v1/id/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export { ApiError }
