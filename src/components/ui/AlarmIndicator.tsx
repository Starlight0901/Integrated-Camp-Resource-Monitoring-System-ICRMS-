import { Bell, BellOff } from 'lucide-react'
import type { AlarmSeverity } from '@/types'
import { cn, getAlarmSeverityStyle } from '@/utils'

export interface AlarmIndicatorProps {
  count: number
  severity?: AlarmSeverity
  acknowledged?: boolean
  showIcon?: boolean
  className?: string
}

export function AlarmIndicator({
  count,
  severity = 'warning',
  acknowledged = false,
  showIcon = true,
  className,
}: AlarmIndicatorProps) {
  const style = getAlarmSeverityStyle(severity)
  const Icon = acknowledged ? BellOff : Bell

  if (count === 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-cw-sm border border-cw-border-subtle bg-cw-surface px-2.5 py-1 text-xs text-cw-text-dim',
          className,
        )}
      >
        {showIcon && <Bell className="h-3.5 w-3.5" strokeWidth={1.75} />}
        No alarms
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-cw-sm border font-medium',
        style.badge,
        severity === 'critical' && !acknowledged && style.glow,
        'px-2.5 py-1 text-xs',
        className,
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            'h-3.5 w-3.5',
            !acknowledged && severity === 'critical' && 'animate-cw-pulse-dot',
          )}
          strokeWidth={1.75}
        />
      )}
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', style.dot)} />
      {count} {count === 1 ? 'alarm' : 'alarms'}
    </span>
  )
}
