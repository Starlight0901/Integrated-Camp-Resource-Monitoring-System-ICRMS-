import type { DoraStatus } from '@/types'
import { DORA_STATUS_LABELS } from '@/types'
import { cn } from '@/utils'

export interface DoraStatusBadgeProps {
  status: DoraStatus
  size?: 'sm' | 'md'
  pulse?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[11px] gap-1.5',
  md: 'px-2.5 py-1 text-xs gap-2',
} as const

const badgeClasses: Record<DoraStatus, string> = {
  normal:
    'bg-cw-status-normal-bg text-cw-status-normal border-cw-status-normal/30',
  warning:
    'bg-cw-status-warning-bg text-cw-status-warning border-cw-status-warning/25',
  critical:
    'bg-cw-status-critical-bg text-cw-status-critical border-cw-status-critical/25',
}

const dotClasses: Record<DoraStatus, string> = {
  normal: 'bg-cw-status-normal',
  warning: 'bg-cw-status-warning',
  critical: 'bg-cw-status-critical',
}

export function DoraStatusBadge({
  status,
  size = 'md',
  pulse = false,
  className,
}: DoraStatusBadgeProps) {
  const shouldPulse = pulse && (status === 'warning' || status === 'critical')

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-cw-sm border font-medium uppercase tracking-wide',
        badgeClasses[status],
        sizeClasses[size],
        className,
      )}
    >
      <span
        className={cn(
          'inline-block h-2 w-2 shrink-0 rounded-full',
          dotClasses[status],
          shouldPulse && 'animate-cw-pulse-dot',
        )}
      />
      {DORA_STATUS_LABELS[status]}
    </span>
  )
}
