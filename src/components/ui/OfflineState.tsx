import type { ReactNode } from 'react'
import { WifiOff } from 'lucide-react'
import { cn } from '@/utils'

export interface OfflineStateProps {
  title?: string
  description?: string
  action?: ReactNode
  compact?: boolean
  className?: string
}

export function OfflineState({
  title = 'Camp communication unavailable',
  description = 'Telemetry and alarms cannot be retrieved until the site reconnects.',
  action,
  compact = false,
  className,
}: OfflineStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-cw-lg border border-cw-status-offline/30 bg-cw-status-offline-bg text-center',
        compact ? 'px-4 py-8' : 'px-6 py-12',
        className,
      )}
    >
      <WifiOff
        className={cn(
          'text-cw-status-offline',
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
