import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils'

export interface ErrorStateProps {
  title?: string
  description?: string
  action?: ReactNode
  compact?: boolean
  className?: string
}

export function ErrorState({
  title = 'Unable to load camp telemetry',
  description,
  action,
  compact = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-cw-lg border border-cw-status-critical/25 bg-cw-status-critical-bg text-center',
        compact ? 'px-4 py-8' : 'px-6 py-12',
        className,
      )}
    >
      <AlertCircle
        className={cn(
          'text-cw-status-critical/80',
          compact ? 'h-5 w-5' : 'h-6 w-6',
        )}
        strokeWidth={1.75}
      />
      <h3
        className={cn(
          'font-medium text-cw-text',
          compact ? 'mt-2.5 text-sm' : 'mt-3 text-sm',
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            'mt-1.5 max-w-md text-cw-text-muted',
            compact ? 'text-xs' : 'text-sm',
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
