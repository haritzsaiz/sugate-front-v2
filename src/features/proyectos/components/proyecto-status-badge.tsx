import { Play, Clock, CheckCircle, XCircle, FileText, FileX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  type ProjectStatus,
  projectStatusLabels,
  projectStatusColors,
} from '../data/schema'

interface ProyectoStatusBadgeProps {
  status: ProjectStatus
  showIcon?: boolean
  className?: string
}

const statusIcons: Record<ProjectStatus, React.ReactNode> = {
  presupuesto: <FileText className='h-3 w-3' />,
  presupuesto_abandonado: <FileX className='h-3 w-3' />,
  planificacion: <Clock className='h-3 w-3' />,
  en_ejecucion: <Play className='h-3 w-3' />,
  finalizado: <CheckCircle className='h-3 w-3' />,
  cancelado: <XCircle className='h-3 w-3' />,
}

export function ProyectoStatusBadge({ 
  status, 
  showIcon = true, 
  className 
}: ProyectoStatusBadgeProps) {
  const label = projectStatusLabels[status] ?? status
  const colorClass = projectStatusColors[status] ?? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
  const icon = statusIcons[status] ?? null

  return (
    <Badge
      variant='outline'
      className={`flex w-fit items-center gap-1 ${colorClass} ${className ?? ''}`}
    >
      {showIcon && icon}
      {label}
    </Badge>
  )
}
