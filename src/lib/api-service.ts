// Core API Service for making HTTP requests
import { authService } from './auth-service'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  // Get the access token
  const accessToken = await authService.getAccessToken()

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  }

  const response = await fetch(url, config)

  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    await authService.signinRedirect()
    throw new ApiError('Unauthorized', 401, 'Unauthorized')
  }

  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      errorData = await response.text()
    }

    throw new ApiError(
      `API Error: ${response.status} ${response.statusText}`,
      response.status,
      response.statusText,
      errorData
    )
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export async function makeFileRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ blob: Blob; contentType: string }> {
  const url = `${API_BASE_URL}${endpoint}`

  // Get the access token
  const accessToken = await authService.getAccessToken()

  const config: RequestInit = {
    ...options,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  }

  const response = await fetch(url, config)

  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    await authService.signinRedirect()
    throw new ApiError('Unauthorized', 401, 'Unauthorized')
  }

  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      errorData = await response.text()
    }

    throw new ApiError(
      `API Error: ${response.status} ${response.statusText}`,
      response.status,
      response.statusText,
      errorData
    )
  }

  const blob = await response.blob()
  const contentType = response.headers.get('Content-Type') || 'application/octet-stream'

  return { blob, contentType }
}
