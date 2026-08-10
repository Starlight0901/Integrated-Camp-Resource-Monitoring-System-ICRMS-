import type { CampStatus } from '@/types'
import { cn, getCampStatusStyle, statusDotClasses } from '@/utils'

export interface StatusBadgeProps {
  status: CampStatus
  size?: 'sm' | 'md'
  showDot?: boolean
  pulse?: boolean
  label?: string
  className?: string
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[11px] gap-1.5',
  md: 'px-2.5 py-1 text-xs gap-2',
} as const

export function StatusBadge({
  status,
  size = 'md',
  showDot = true,
  pulse = false,
  label,
  className,
}: StatusBadgeProps) {
  const style = getCampStatusStyle(status)
  const displayLabel = label ?? style.label
  const shouldPulse =
    pulse && (status === 'warning' || status === 'critical')

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-cw-sm border font-medium uppercase tracking-wide',
        style.badge,
        sizeClasses[size],
        className,
      )}
    >
      {showDot && (
        <span
          className={statusDotClasses(status, {
            pulse: shouldPulse,
          })}
        />
      )}
      {displayLabel}
    </span>
  )
}
