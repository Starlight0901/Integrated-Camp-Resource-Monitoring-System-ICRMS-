import type { LucideIcon } from 'lucide-react'
import { BarChart3 } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils'

export interface NoDataStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: ReactNode
  compact?: boolean
  className?: string
}

export function NoDataState({
  icon: Icon = BarChart3,
  title = 'No historical telemetry available',
  description = 'Readings will appear here once data is received from the camp site.',
  action,
  compact = false,
  className,
}: NoDataStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-cw-lg border border-dashed border-cw-border-subtle bg-cw-surface/40 text-center',
        compact ? 'px-4 py-8' : 'px-6 py-12',
        className,
      )}
    >
      <Icon
        className={cn('text-cw-text-dim', compact ? 'h-5 w-5' : 'h-6 w-6')}
        strokeWidth={1.5}
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
