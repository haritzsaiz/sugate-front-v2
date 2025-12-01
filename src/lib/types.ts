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
  estado?: ProjectStatus; // Initial state, defaults to 'presupuesto'
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
  concepto: string; // JSON: "concepto"
  referencia: string; // Reference code
  importe: number; // Base amount
  descuento: number; // Discount amount (absolute value)
  iva: number; // IVA percentage (0, 4, 10, 21, etc.)
  iva_importe: number; // IVA amount calculated
  // UI-only properties
  id: string;
}

export interface BudgetSection {
  // Mapped from Go's BudgetSection
  concepto: string; // JSON: "concepto" (section title)
  items: BudgetItem[];
  subtotal: number;
  // UI-only properties
  id: string;
}

export interface BudgetData {
  // Mapped from Go's Budget
  id: string;
  version: number;
  created_at: string;
  secciones: BudgetSection[];
}

// Helper function to calculate budget totals from sections
export function calculateBudgetTotals(budget: BudgetData | null | undefined): {
  subtotalBruto: number;
  totalDescuentos: number;
  subtotalNeto: number;
  totalIva: number;
  total: number;
} {
  if (!budget || !budget.secciones) {
    return { subtotalBruto: 0, totalDescuentos: 0, subtotalNeto: 0, totalIva: 0, total: 0 };
  }

  let subtotalBruto = 0;
  let totalDescuentos = 0;
  let totalIva = 0;

  budget.secciones.forEach(section => {
    section.items.forEach(item => {
      subtotalBruto += item.importe;
      totalDescuentos += item.descuento || 0;
      totalIva += item.iva_importe || 0;
    });
  });

  const subtotalNeto = subtotalBruto - totalDescuentos;
  const total = subtotalNeto + totalIva;

  return { subtotalBruto, totalDescuentos, subtotalNeto, totalIva, total };
}

// Billing Types - Mapped from Go backend models

export type BillingMilestoneStatus = 'pendiente' | 'facturado' | 'cobrado';
export type BillingMilestoneAmountType = 'porcentaje' | 'euro';

export interface HitoFacturacion {
  id: string;
  nombre: string;
  tipo_de_importe: BillingMilestoneAmountType;
  importe: number;
  total: number;
  estado: BillingMilestoneStatus;
  fecha_facturacion?: string;
  created_at: string;
  updated_at: string;
}

export interface Billing {
  id: string
  id_proyecto: string
  direccion_facturacion?: string
  codigo_postal?: string
  presupuesto: BudgetData
  hitos_facturacion: HitoFacturacion[]
  created_at: string
  updated_at: string
}

// Financial Record Types for the Finanzas view
export interface FinancialRecord {
  projectId: string
  projectName: string
  clientId: string
  clientName: string
  office: string
  projectStatus: ProjectStatus
  createdAt: string
  totalBudget: number
  paymentsReceived: number
  facturado: number
  pendiente_factura: number
  unassigned: number
}
