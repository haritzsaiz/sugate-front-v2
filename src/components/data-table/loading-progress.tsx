import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface DataTableLoadingProgressProps {
  isLoading?: boolean
  colSpan?: number
  className?: string
}

export function DataTableLoadingProgress({
  isLoading = false,
  colSpan = 1,
  className,
}: DataTableLoadingProgressProps) {
  if (!isLoading) return null

  return (
    <tr className={cn('border-0', className)}>
      <td colSpan={colSpan} className='p-0'>
        <Progress indeterminate className='h-0.5 rounded-none' />
      </td>
    </tr>
  )
}
