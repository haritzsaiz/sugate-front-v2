// Project Types

export type ProjectStatus = 
  | 'presupuesto'
  | 'planificacion'
  | 'en_ejecucion'
  | 'finalizado'
  | 'cancelado';

export interface ProjectStatusChange {
  estado: ProjectStatus;
  fecha: string;
  nota?: string;
}

export interface Budget {
  id: string;
  project_id: string;
  nombre: string;
  total: number;
  estado: 'borrador' | 'enviado' | 'aprobado' | 'rechazado';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  id_cliente: string;
  direccion: string;
  ciudad: string;
  oficina?: string;
  estado: ProjectStatus;
  budget_id_aprobado?: string;
  prevision: {
    fecha_inicio: string;
    dias_ejecucion: number;
  };
  planificacion: {
    fecha_inicio: string;
  };
  ejecucion: {
    fecha_inicio: string;
    fecha_fin: string;
  };
  fechas_cambio_estado: ProjectStatusChange[];
  created_at: string;
  updated_at: string;
  presupuestos?: Budget[];
}

export interface CreateProjectData {
  id_cliente: string;
  direccion: string;
  ciudad: string;
  oficina?: string;
}

export type UpdateProjectData = Project;

export interface StatusChangeData {
  project_id: string;
  nuevo_estado: ProjectStatus;
  nota?: string;
}
