// Project-specific service extending the core ApiService
import { Project, CreateProjectData, UpdateProjectData } from './types'
import { makeRequest, makeFileRequest } from './api-service'

// Core CRUD operations using ApiService functions
export const getAllProjects = (): Promise<Project[]> => {
  return makeRequest<Project[]>('/proyectos/v1')
}

export const getProjectById = (id: string): Promise<Project | null> => {
  return makeRequest<Project>(`/proyectos/v1/${encodeURIComponent(id)}`)
}

export const createProject = (projectData: CreateProjectData): Promise<Project> => {
  return makeRequest<Project>('/proyectos/v1', {
    method: 'POST',
    body: JSON.stringify(projectData),
  })
}

export const updateProject = (projectData: UpdateProjectData): Promise<Project> => {
  return makeRequest<Project>(`/proyectos/v1`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  })
}

export const deleteProject = (id: string): Promise<void> => {
  return makeRequest<void>(`/proyectos/v1/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

// New function to generate and download a budget PDF
export const generateBudgetPdf = async (
  projectId: string,
  budgetId: string,
  projectAddress: string,
  budgetDate: string
): Promise<void> => {
  const endpoint = `/proyectos/v1/${encodeURIComponent(projectId)}/presupuesto/${encodeURIComponent(budgetId)}`

  try {
    const { blob } = await makeFileRequest(endpoint, {
      method: 'POST',
    })

    // Sanitize address and format date for the filename
    const safeAddress = projectAddress.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const formattedDate = new Date(budgetDate).toISOString().split('T')[0]
    const filename = `Presupuesto_${safeAddress}_${formattedDate}.pdf`

    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()

    // Clean up
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Failed to generate budget PDF:', error)
    throw error
  }
}
