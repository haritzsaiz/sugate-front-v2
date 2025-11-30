// Project Types

export type ProjectStatus = 
  | 'presupuesto'
  | 'presupuesto_abandonado'
  | 'planificacion'
  | 'en_ejecucion'
  | 'finalizado'
  | 'cancelado';

export interface ProjectStatusChange {
  estado: ProjectStatus;
  fecha: string;
  nota?: string;
}

export interface ProjectBudget {
  id: string;
  project_id: string;
  nombre: string;
  total: number;
  estado: 'borrador' | 'enviado' | 'aprobado' | 'rechazado';
  created_at: string;
  updated_at: string;
  // Budget data following Go model
  budget_data?: BudgetData;
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
  presupuestos?: BudgetData[];
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

// Oficina Types
export interface Oficina {
  id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

// Budget Types - Mapped from Go backend models

export interface BudgetItem {
  // Mapped from Go's BudgetItem
  titulo: string;
  precio: number;
  // UI-only properties
  id: string;
}

export interface BudgetSection {
  // Mapped from Go's BudgetSection
  titulo: string;
  items: BudgetItem[];
  subtotal: number;
  // UI-only properties
  id: string;
}

export interface BudgetData {
  // Mapped from Go's Budget
  id: string;
  created_at: string;
  total_sin_iva: number;
  iva_aplicado: number; // VAT percentage
  iva_importe: number; // VAT amount
  total_con_iva: number;
  secciones: BudgetSection[];
}

// Billing Types - Mapped from Go backend models

export interface HitoFacturacion {
  nombre: string;
  porcentaje: number;
  importe: number;
  facturado: boolean;
  fecha_facturacion?: string;
}

export interface Billing {
  id: string;
  id_proyecto: string;
  presupuesto: BudgetData;
  hitos_facturacion: HitoFacturacion[];
  created_at: string;
  updated_at: string;
}
