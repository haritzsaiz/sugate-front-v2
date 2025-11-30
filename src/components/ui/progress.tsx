import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.ComponentProps<'div'> {
  value?: number
  indeterminate?: boolean
}

function Progress({
  className,
  value = 0,
  indeterminate = false,
  ...props
}: ProgressProps) {
  return (
    <div
      data-slot='progress'
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : value}
      className={cn(
        'bg-primary/20 relative h-1 w-full overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      <div
        data-slot='progress-indicator'
        className={cn(
          'bg-primary h-full transition-all duration-300 ease-in-out',
          indeterminate && 'animate-progress-indeterminate w-1/3'
        )}
        style={indeterminate ? undefined : { width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export { Progress }
