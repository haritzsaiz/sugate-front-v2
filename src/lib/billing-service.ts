// Billing-specific service for the new facturacion endpoints
import type { Billing } from './types'
import { makeRequest, ApiError, API_BASE_URL } from './api-service'
import { authService } from './auth-service'

export { ApiError }

export const getBillingByProjectId = async (projectId: string): Promise<Billing | null> => {
  try {
    return await makeRequest<Billing>(`/facturacion/v1/proyecto/${encodeURIComponent(projectId)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    console.error(`Error fetching billing for project ${projectId}:`, error)
    throw error
  }
}

export const createBilling = (billingData: Omit<Billing, 'id' | 'created_at' | 'updated_at'>): Promise<Billing> => {
  return makeRequest<Billing>('/facturacion/v1', {
    method: 'POST',
    body: JSON.stringify(billingData),
  })
}

export const updateBilling = (billingData: Billing): Promise<Billing> => {
  return makeRequest<Billing>('/facturacion/v1', {
    method: 'PUT',
    body: JSON.stringify(billingData),
  })
}

export const exportToExcel = async (dateRange: { from?: Date; to?: Date }): Promise<Blob> => {
  const url = `${API_BASE_URL}/facturacion/v1/excel-export`

  // Get the access token
  const accessToken = await authService.getAccessToken()

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      fecha_inicio: dateRange.from?.toISOString(),
      fecha_fin: dateRange.to?.toISOString(),
    }),
  })

  if (!response.ok) {
    throw new ApiError(`Excel export failed: ${response.statusText}`, response.status, response.statusText)
  }

  return response.blob()
}
