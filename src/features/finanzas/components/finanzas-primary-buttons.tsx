import { Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FinanzasPrimaryButtonsProps {
  onRefresh?: () => void
  onExport?: () => void
  exportLoading?: boolean
  refreshLoading?: boolean
}

export function FinanzasPrimaryButtons({
  onRefresh,
  onExport,
  exportLoading,
  refreshLoading,
}: FinanzasPrimaryButtonsProps) {
  return (
    <div className='flex gap-2'>
      {onRefresh && (
        <Button
          variant='outline'
          className='space-x-1'
          onClick={onRefresh}
          disabled={refreshLoading}
        >
          <RefreshCw className={`h-4 w-4 ${refreshLoading ? 'animate-spin' : ''}`} />
          <span>{refreshLoading ? 'Actualizando...' : 'Actualizar'}</span>
        </Button>
      )}
      {onExport && (
        <Button
          onClick={onExport}
          disabled={exportLoading}
          className='space-x-1 bg-green-600 hover:bg-green-700'
        >
          <Download className={`h-4 w-4 ${exportLoading ? 'animate-spin' : ''}`} />
          <span>{exportLoading ? 'Exportando...' : 'Exportar Excel'}</span>
        </Button>
      )}
    </div>
  )
}
