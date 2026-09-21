import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import type { AlarmSeverity, SystemAlarm } from '@/types'
import { cn } from '@/utils'
import { getActiveAlarms, getTopAlarmSeverity } from '@/utils/alarms'
import { Skeleton } from '@/components/ui'
import { navigateToAlarm } from './alarmNavigation'
import { AlarmListItem } from './AlarmListItem'

export interface AlarmBellPanelProps {
  alarms: SystemAlarm[]
  loading?: boolean
  className?: string
}

const neutralBellClasses =
  'border-cw-border-subtle bg-cw-surface text-cw-text-muted hover:border-cw-border hover:bg-cw-surface-hover hover:text-cw-text'

export function AlarmBellPanel({
  alarms,
  loading = false,
  className,
}: AlarmBellPanelProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeAlarms = getActiveAlarms(alarms)
  const topSeverity: AlarmSeverity | null = getTopAlarmSeverity(alarms)
  const hasCritical = topSeverity === 'critical'

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleAlarmSelect = (alarm: SystemAlarm) => {
    setOpen(false)
    navigateToAlarm(navigate, alarm)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-label={`${activeAlarms.length} active alarms`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-cw-md border transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cw-bg',
          hasCritical
            ? 'border-cw-status-critical/35 bg-cw-status-critical-bg text-cw-status-critical'
            : neutralBellClasses,
        )}
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {activeAlarms.length > 0 && topSeverity && (
          <span
            className={cn(
              'absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white',
              topSeverity === 'critical' &&
                'bg-cw-status-critical animate-cw-pulse-dot',
              topSeverity === 'warning' && 'bg-cw-status-warning',
            )}
          >
            {activeAlarms.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full z-[100] mt-2 w-[min(100vw-2rem,380px)] overflow-hidden',
            'rounded-cw-lg border border-cw-border bg-cw-surface shadow-cw-elevated animate-cw-fade-in',
          )}
          role="menu"
        >
          <div className="border-b border-cw-border-subtle px-4 py-3">
            <h3 className="text-sm font-semibold text-cw-text">Active Alarms</h3>
            <p className="mt-0.5 text-xs text-cw-text-muted">
              {loading
                ? 'Loading…'
                : `${activeAlarms.length} active across camps and DORAs`}
            </p>
          </div>

          <div className="max-h-[min(60vh,420px)] overflow-y-auto">
            {loading ? (
              <div className="space-y-0 px-4 py-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="space-y-2 border-b border-cw-border-subtle py-3.5 last:border-0"
                  >
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                ))}
              </div>
            ) : activeAlarms.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-cw-text-muted">
                No active alarms. All camps and DORAs within normal thresholds.
              </p>
            ) : (
              activeAlarms.map((alarm) => (
                <AlarmListItem
                  key={alarm.id}
                  alarm={alarm}
                  onSelect={handleAlarmSelect}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
